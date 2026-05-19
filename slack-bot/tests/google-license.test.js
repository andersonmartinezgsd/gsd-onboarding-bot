import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock googleapis BEFORE importing any module that uses it ──────────────────
vi.mock('googleapis', () => {
  const mockLicensingInsert = vi.fn();
  const mockLicensingDelete = vi.fn();
  const mockUsersInsert     = vi.fn();

  return {
    google: {
      auth: {
        JWT: vi.fn().mockImplementation(() => ({ type: 'jwt' })),
      },
      admin:     vi.fn(() => ({ users: { insert: mockUsersInsert } })),
      licensing: vi.fn(() => ({
        licenseAssignments: {
          insert: mockLicensingInsert,
          delete: mockLicensingDelete,
        },
      })),
      drive: vi.fn(() => ({ files: { create: vi.fn() } })),

      // Expose mocks so tests can access them
      _mocks: { mockLicensingInsert, mockLicensingDelete, mockUsersInsert },
    },
  };
});

// ── Mock appConfig ────────────────────────────────────────────────────────────
vi.mock('../src/config/index.js', () => ({
  appConfig: {
    google: {
      enabled:        true,
      clientEmail:    'sa@test.iam.gserviceaccount.com',
      privateKey:     '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
      adminEmail:     'admin@test.com',
      domain:         'test.com',
      customerId:     'C01234567',
      workspaceSkuId: '1010020028',
      licenseDelayMs: 0,          // 0ms en tests para no ralentizar la suite
      onboardingDriveFolderId: null,
    },
    github:     { enabled: false },
    timedoctor: { enabled: false },
    hubspot:    { enabled: false },
    scalefusion: { enabled: false },
    buk:        { enabled: false },
    channels:   { hr: null, it: null, finance: null, accountManager: null },
  },
}));

import { google } from 'googleapis';
import { googleWorkspace } from '../src/integrations/google.js';
import { googleVoice }     from '../src/integrations/googlevoice.js';
import { getStepsForProcess, ALL_ONBOARDING_STEPS, stepExecutors } from '../src/workflows/steps.js';

// Helper: shortcut to the mocked licensing.insert
function getLicensingInsert() {
  return google._mocks.mockLicensingInsert;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('getStepsForProcess — google_voice gating', () => {
  it('includes assign_google_voice when google_voice is in tools', () => {
    const process = { tools: ['google_workspace', 'google_voice'] };
    const steps = getStepsForProcess(process, ALL_ONBOARDING_STEPS);
    expect(steps.some((s) => s.key === 'assign_google_voice')).toBe(true);
  });

  it('excludes assign_google_voice when google_voice is NOT in tools', () => {
    const process = { tools: ['google_workspace'] };
    const steps = getStepsForProcess(process, ALL_ONBOARDING_STEPS);
    expect(steps.some((s) => s.key === 'assign_google_voice')).toBe(false);
  });

  it('excludes all google steps when google_workspace is not in tools', () => {
    const process = { tools: [] };
    const steps = getStepsForProcess(process, ALL_ONBOARDING_STEPS);
    expect(steps.some((s) => s.key === 'create_google_account')).toBe(false);
    expect(steps.some((s) => s.key === 'assign_google_voice')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('googleWorkspace.assignWorkspaceLicense', () => {
  it('calls licensing.insert with Google-Apps productId', async () => {
    getLicensingInsert().mockReset();
    getLicensingInsert().mockResolvedValueOnce({ data: {} });

    const result = await googleWorkspace.assignWorkspaceLicense('alice@test.com');

    expect(getLicensingInsert()).toHaveBeenCalledOnce();
    const call = getLicensingInsert().mock.calls[0][0];
    expect(call.productId).toBe('Google-Apps');
    expect(call.skuId).toBe('1010020028');
    expect(call.requestBody.userId).toBe('alice@test.com');
    expect(result.success).toBe(true);
  });

  it('treats 409 (already assigned) as success', async () => {
    getLicensingInsert().mockReset();
    // GaxiosError expone el status HTTP en err.status (no err.code)
    getLicensingInsert().mockRejectedValueOnce(Object.assign(new Error('already assigned'), { status: 409 }));

    const result = await googleWorkspace.assignWorkspaceLicense('alice@test.com');
    expect(result.success).toBe(true);
    expect(result.note).toBe('already_assigned');
  });

  it('skips when workspaceSkuId is not configured', async () => {
    getLicensingInsert().mockReset();
    const { appConfig } = await import('../src/config/index.js');
    const original = appConfig.google.workspaceSkuId;
    appConfig.google.workspaceSkuId = null;

    const result = await googleWorkspace.assignWorkspaceLicense('alice@test.com');
    expect(result.skipped).toBe(true);

    appConfig.google.workspaceSkuId = original;
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('googleVoice.assignLicense', () => {
  it('calls licensing.insert with Google-Voice productId', async () => {
    getLicensingInsert().mockReset();
    getLicensingInsert().mockResolvedValueOnce({ data: {} });

    const result = await googleVoice.assignLicense('bob@test.com');

    expect(getLicensingInsert()).toHaveBeenCalledOnce();
    const call = getLicensingInsert().mock.calls[0][0];
    expect(call.productId).toBe('Google-Voice');
    expect(call.requestBody.userId).toBe('bob@test.com');
    expect(result.success).toBe(true);
  });

  it('treats 409 as success', async () => {
    getLicensingInsert().mockReset();
    getLicensingInsert().mockRejectedValueOnce(Object.assign(new Error('already assigned'), { status: 409 }));

    const result = await googleVoice.assignLicense('bob@test.com');
    expect(result.success).toBe(true);
    expect(result.note).toBe('already_assigned');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('stepExecutors.create_google_account — asigna Workspace license', () => {

  it('asigna licencia Workspace tras crear el usuario', async () => {
    getLicensingInsert().mockReset();
    google._mocks.mockUsersInsert.mockReset();
    google._mocks.mockUsersInsert.mockResolvedValueOnce({
      data: { primaryEmail: 'carol@test.com', id: 'uid_001' },
    });
    getLicensingInsert().mockResolvedValueOnce({ data: {} });

    const process = {
      first_name:     'Carol',
      last_name:      'Smith',
      employee_name:  'Carol Smith',
      employee_email: 'carol@test.com',
      department:     'Engineering',
      role_title:     'Dev',
    };

    const result = await stepExecutors.create_google_account(process);

    expect(result.success).toBe(true);
    expect(result.workspaceLicense).toBeDefined();
    expect(result.workspaceLicense.success).toBe(true);

    // Licensing API debe haber sido llamado con Google-Apps
    const licCall = getLicensingInsert().mock.calls.find(
      (c) => c[0].productId === 'Google-Apps'
    );
    expect(licCall).toBeDefined();
  });

  it('no llama a assignWorkspaceLicense si createUser devuelve skipped', async () => {
    getLicensingInsert().mockReset();
    google._mocks.mockUsersInsert.mockReset();

    const { appConfig } = await import('../src/config/index.js');
    const original = appConfig.google.enabled;
    appConfig.google.enabled = false;

    const process = {
      employee_name:  'Dana Lee',
      employee_email: 'dana@test.com',
    };

    try {
      const result = await stepExecutors.create_google_account(process);
      expect(result.skipped).toBe(true);
      expect(getLicensingInsert()).not.toHaveBeenCalled();
    } finally {
      appConfig.google.enabled = original; // siempre restaura aunque falle un expect
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('stepExecutors.assign_google_voice — espera delay antes de asignar', () => {
  it('llama a googleVoice.assignLicense con el email correcto', async () => {
    getLicensingInsert().mockReset();
    getLicensingInsert().mockResolvedValueOnce({ data: {} });

    const process = { employee_email: 'eric@test.com' };
    const result = await stepExecutors.assign_google_voice(process);

    expect(result.success).toBe(true);
    const call = getLicensingInsert().mock.calls[0][0];
    expect(call.productId).toBe('Google-Voice');
    expect(call.requestBody.userId).toBe('eric@test.com');
  });
});
