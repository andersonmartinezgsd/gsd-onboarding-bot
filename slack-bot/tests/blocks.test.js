import { describe, it, expect } from 'vitest';
import { buildOnboardingTrackerBlocks } from '../src/blocks/onboarding.js';
import { buildOffboardingTrackerBlocks } from '../src/blocks/offboarding.js';
import { buildOnboardingModal, buildOffboardingModal } from '../src/blocks/modals.js';
import { checklistBlock, statusEmoji } from '../src/blocks/shared.js';

const mockOnboardingProcess = {
  id: 1,
  process_type: 'onboarding',
  status: 'in_progress',
  employee_name: 'Jane Doe',
  employee_email: 'jane.doe@company.com',
  department: 'Engineering',
  role_title: 'Software Engineer',
  start_date: '2026-04-14',
  manager_slack: 'U0MANAGER',
  initiated_by: 'U0HR',
  created_at: '2026-04-06T10:00:00',
  repos: [],
  channels: [],
};

const mockSteps = [
  { step_key: 'create_google_account', step_label: 'Create Google Workspace account', status: 'completed', error_message: null },
  { step_key: 'invite_github_org', step_label: 'GitHub org invite', status: 'in_progress', error_message: null },
  { step_key: 'invite_slack_channels', step_label: 'Add to Slack channels', status: 'pending', error_message: null },
  { step_key: 'hardware_ready', step_label: 'Hardware ready', status: 'failed', error_message: 'Hardware not available' },
];

describe('Onboarding blocks', () => {
  it('builds tracker blocks array', () => {
    const blocks = buildOnboardingTrackerBlocks(mockOnboardingProcess, mockSteps);
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(3);
  });

  it('includes employee name in section', () => {
    const blocks = buildOnboardingTrackerBlocks(mockOnboardingProcess, mockSteps);
    const json = JSON.stringify(blocks);
    expect(json).toContain('Jane Doe');
    expect(json).toContain('jane.doe@company.com');
  });

  it('includes action buttons when in_progress', () => {
    const blocks = buildOnboardingTrackerBlocks(mockOnboardingProcess, mockSteps);
    const actionBlock = blocks.find((b) => b.type === 'actions');
    expect(actionBlock).toBeTruthy();
    expect(actionBlock.elements.some((e) => e.action_id === 'onboarding_hardware_ready')).toBe(true);
  });

  it('no action buttons when completed', () => {
    const completedProcess = { ...mockOnboardingProcess, status: 'completed' };
    const blocks = buildOnboardingTrackerBlocks(completedProcess, mockSteps);
    const actionBlock = blocks.find((b) => b.type === 'actions');
    expect(actionBlock).toBeUndefined();
  });
});

describe('Offboarding blocks', () => {
  const mockOffboarding = {
    id: 2,
    process_type: 'offboarding',
    status: 'in_progress',
    employee_name: 'John Smith',
    employee_email: 'john@company.com',
    last_day: '2026-04-18',
    manager_slack: 'U0MANAGER',
    offboard_reason: 'resignation',
    file_transfer_to: 'U0RECIPIENT',
    initiated_by: 'U0HR',
    created_at: '2026-04-06T10:00:00',
  };

  it('builds offboarding tracker blocks', () => {
    const blocks = buildOffboardingTrackerBlocks(mockOffboarding, mockSteps);
    expect(Array.isArray(blocks)).toBe(true);
    const json = JSON.stringify(blocks);
    expect(json).toContain('John Smith');
    expect(json).toContain('Voluntary Resignation');
  });

  it('includes revoke button', () => {
    const blocks = buildOffboardingTrackerBlocks(mockOffboarding, mockSteps);
    const actionBlock = blocks.find((b) => b.type === 'actions');
    expect(actionBlock?.elements.some((e) => e.action_id === 'offboarding_revoke_all')).toBe(true);
  });
});

describe('Modals', () => {
  it('onboarding modal has correct callback_id', () => {
    const modal = buildOnboardingModal();
    expect(modal.callback_id).toBe('modal_onboarding_submit');
    expect(modal.blocks.length).toBeGreaterThan(5);
  });

  it('offboarding modal has correct callback_id', () => {
    const modal = buildOffboardingModal();
    expect(modal.callback_id).toBe('modal_offboarding_submit');
    expect(modal.blocks.length).toBeGreaterThan(4);
  });
});

describe('statusEmoji', () => {
  it('maps all statuses', () => {
    expect(statusEmoji('completed')).toBe('white_check_mark');
    expect(statusEmoji('in_progress')).toBe('hourglass_flowing_sand');
    expect(statusEmoji('failed')).toBe('x');
    expect(statusEmoji('pending')).toBe('white_circle');
    expect(statusEmoji('skipped')).toBe('next_track_button');
  });
});
