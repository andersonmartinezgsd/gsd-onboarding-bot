import { describe, it, expect } from 'vitest';
import { getDefaultTools, BASE_TOOLS, DEPARTMENT_TOOLS } from '../src/config/roles.js';
import { getStepsForProcess, ALL_ONBOARDING_STEPS, ALL_OFFBOARDING_STEPS } from '../src/workflows/steps.js';

describe('getDefaultTools', () => {
  it('always includes google_workspace', () => {
    const tools = getDefaultTools(null, null);
    expect(tools).toContain('google_workspace');
  });

  it('engineering gets slack, timedoctor, github', () => {
    const tools = getDefaultTools('engineering', 'Developer');
    expect(tools).toContain('google_workspace');
    expect(tools).toContain('slack');
    expect(tools).toContain('timedoctor');
    expect(tools).toContain('github');
    expect(tools).not.toContain('hubspot');
    expect(tools).not.toContain('google_voice');
  });

  it('sales gets hubspot and google_voice', () => {
    const tools = getDefaultTools('sales', 'Sales Rep');
    expect(tools).toContain('hubspot');
    expect(tools).toContain('google_voice');
    expect(tools).toContain('slack');
    expect(tools).toContain('timedoctor');
  });

  it('role title overrides department tools', () => {
    // Marketing dept normally no GitHub, but CTO role gets it
    const tools = getDefaultTools('marketing', 'CTO');
    expect(tools).toContain('github');
    expect(tools).toContain('google_voice');
  });

  it('no duplicates in tool list', () => {
    const tools = getDefaultTools('sales', 'Sales Rep');
    const unique = new Set(tools);
    expect(tools.length).toBe(unique.size);
  });
});

describe('getStepsForProcess - onboarding', () => {
  const makeProcess = (tools) => ({ tools });

  it('google_workspace only → only workspace steps + always-on steps', () => {
    const steps = getStepsForProcess(makeProcess(['google_workspace']), ALL_ONBOARDING_STEPS);
    const keys = steps.map((s) => s.key);
    expect(keys).toContain('create_google_account');
    expect(keys).toContain('create_drive_folder');
    expect(keys).toContain('notify_manager');   // tool: null → always
    expect(keys).toContain('hardware_ready');    // tool: null → always
    expect(keys).not.toContain('invite_slack_channels');
    expect(keys).not.toContain('create_timedoctor_user');
    expect(keys).not.toContain('invite_hubspot_user');
    expect(keys).not.toContain('invite_github_org');
    expect(keys).not.toContain('assign_google_voice');
  });

  it('full access → all steps included', () => {
    const tools = ['google_workspace', 'slack', 'timedoctor', 'hubspot', 'github', 'google_voice'];
    const steps = getStepsForProcess(makeProcess(tools), ALL_ONBOARDING_STEPS);
    const keys = steps.map((s) => s.key);
    expect(keys).toContain('create_google_account');
    expect(keys).toContain('invite_slack_channels');
    expect(keys).toContain('create_timedoctor_user');
    expect(keys).toContain('invite_hubspot_user');
    expect(keys).toContain('invite_github_org');
    expect(keys).toContain('assign_google_voice');
  });

  it('engineering → no hubspot or voice', () => {
    const tools = ['google_workspace', 'slack', 'timedoctor', 'github'];
    const steps = getStepsForProcess(makeProcess(tools), ALL_ONBOARDING_STEPS);
    const keys = steps.map((s) => s.key);
    expect(keys).toContain('invite_github_org');
    expect(keys).not.toContain('invite_hubspot_user');
    expect(keys).not.toContain('assign_google_voice');
  });
});

describe('getStepsForProcess - offboarding', () => {
  it('revoke steps match tools', () => {
    const tools = ['google_workspace', 'github', 'hubspot'];
    const steps = getStepsForProcess({ tools }, ALL_OFFBOARDING_STEPS);
    const keys = steps.map((s) => s.key);
    expect(keys).toContain('revoke_github_access');
    expect(keys).toContain('revoke_hubspot');
    expect(keys).toContain('suspend_google_account');
    expect(keys).not.toContain('deactivate_timedoctor');
    expect(keys).not.toContain('revoke_google_voice');
    expect(keys).not.toContain('deactivate_slack');
  });
});
