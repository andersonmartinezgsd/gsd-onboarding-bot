/**
 * Step definitions and executors.
 *
 * ORDER matches the agreed onboarding sequence:
 *   9.1  → create_google_account
 *   9.2  → create_drive_folder
 *   9.3  → assign_google_voice (only if tool = google_voice)
 *   9.4  → invite_slack_user + invite_slack_channels + send_welcome_dm
 *   9.5  → create_timedoctor_user
 *   9.6  → validate_buk
 *   9.7.1→ notify_it_equipment
 *   9.7.2→ notify_finance
 *   9.7.3→ notify_account_manager
 *   9.7.4→ notify_hr_notifications_done
 *   GATE → gate_hr_verify_notifications
 *   GATE → gate_it_equipment_available
 *   GATE → gate_device_shipped
 *   GATE → gate_device_received
 *   GATE → gate_hr_paperwork
 *   GATE → gate_finance_payroll
 *        → notify_manager
 *   GATE → gate_manager_confirm
 */

export const ACTORS = {
  hr:      { label: 'HR',              emoji: '👩‍💼', slackChannel: 'HR_CHANNEL_ID' },
  it:      { label: 'IT',              emoji: '💻',  slackChannel: 'IT_CHANNEL_ID' },
  manager: { label: 'Direct Manager',  emoji: '👨‍💼', slackChannel: null },
  finance: { label: 'Finance/Payroll', emoji: '💰',  slackChannel: 'FINANCE_CHANNEL_ID' },
};

import { github } from '../integrations/github.js';
import { googleWorkspace } from '../integrations/google.js';
import { googleVoice } from '../integrations/googlevoice.js';
import { slackIntegration } from '../integrations/slack.js';
import { timedoctor } from '../integrations/timedoctor.js';
import { hubspot } from '../integrations/hubspot.js';
import { scalefusion } from '../integrations/scalefusion.js';
import { buk } from '../integrations/buk.js';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

// ─── Step Definitions ──────────────────────────────────────────────────────────

export const ALL_ONBOARDING_STEPS = [
  // 9.1
  { key: 'create_google_account',        label: 'Create Google Workspace account (@gsdoutsources.com)', tool: 'google_workspace', manual: false, actor: 'it',      blocking: false },
  // 9.2
  { key: 'create_drive_folder',          label: 'Create onboarding folder in Google Drive',              tool: 'google_workspace', manual: false, actor: 'it',      blocking: false },
  // 9.3
  { key: 'assign_google_voice',          label: 'Activate Google Voice license',                         tool: 'google_voice',     manual: false, actor: 'it',      blocking: false },
  // 9.4
  { key: 'invite_slack_user',            label: 'Invite user to Slack workspace',                        tool: 'slack',            manual: false, actor: 'it',      blocking: false },
  { key: 'invite_slack_channels',        label: 'Add to Slack channels',                                 tool: 'slack',            manual: false, actor: 'it',      blocking: false },
  { key: 'send_welcome_dm',              label: 'Send welcome DM in Slack',                              tool: 'slack',            manual: false, actor: null,      blocking: false },
  // GitHub
  { key: 'invite_github_org',            label: 'Send GitHub organization invitation',                   tool: 'github',           manual: false, actor: 'it',      blocking: false },
  { key: 'assign_github_repos',          label: 'Assign GitHub repositories',                            tool: 'github',           manual: false, actor: 'it',      blocking: false },
  // HubSpot
  { key: 'invite_hubspot_user',          label: 'Invite to HubSpot CRM',                                 tool: 'hubspot',          manual: false, actor: 'it',      blocking: false },
  // 9.5
  { key: 'create_timedoctor_user',       label: 'Create Time Doctor user',                               tool: 'timedoctor',       manual: false, actor: 'hr',      blocking: false },
  // MDM
  { key: 'send_scalefusion_enrollment',  label: 'Send MDM enrollment invitation (ScaleFusion)',          tool: null,               manual: false, actor: 'it',      blocking: false },
  // 9.6
  { key: 'validate_buk',                 label: 'Validate employee created in BUK',                      tool: null,               manual: false, actor: 'hr',      blocking: false },
  // 9.7.1
  { key: 'notify_it_equipment',          label: 'Notify IT: validate equipment availability',            tool: null,               manual: false, actor: 'it',      blocking: false },
  // 9.7.2
  { key: 'notify_finance',               label: 'Notify Finance: data for payment system',               tool: null,               manual: false, actor: 'finance', blocking: false },
  // 9.7.3
  { key: 'notify_account_manager',       label: 'Notify Account Manager of new hire',                    tool: null,               manual: false, actor: null,      blocking: false },
  // 9.7.4
  { key: 'notify_hr_notifications_done', label: 'Notify HR: all notifications sent',                     tool: null,               manual: false, actor: null,      blocking: false },
  // Gates
  { key: 'gate_hr_verify_notifications', label: 'HR: Confirm all responsible parties were notified',     tool: null,               manual: true,  actor: 'hr',      blocking: true  },
  { key: 'gate_it_equipment_available',  label: 'IT: Confirm equipment availability',                    tool: null,               manual: true,  actor: 'it',      blocking: true  },
  { key: 'gate_device_shipped',          label: 'IT: Confirm device shipped (attach guide if applicable)', tool: null,             manual: true,  actor: 'it',      blocking: true  },
  { key: 'gate_device_received',         label: 'HR / Employee: Confirm device received',                tool: null,               manual: true,  actor: 'hr',      blocking: true  },
  { key: 'gate_hr_paperwork',            label: 'HR: Confirm contracts and documents signed',             tool: null,               manual: true,  actor: 'hr',      blocking: true  },
  { key: 'gate_finance_payroll',         label: 'Finance: Confirm payroll set up in payment system',      tool: null,               manual: true,  actor: 'finance', blocking: true  },
  { key: 'notify_manager',              label: 'Notify direct manager',                                   tool: null,               manual: false, actor: null,      blocking: false },
  { key: 'gate_manager_confirm',         label: 'Manager: Confirm employee was briefed and is ready',     tool: null,               manual: true,  actor: 'manager', blocking: true  },
];

export const ALL_OFFBOARDING_STEPS = [
  { key: 'notify_manager_offboard',   label: 'Notify manager of offboarding',                       tool: null,               manual: false, actor: null,      blocking: false },
  { key: 'gate_manager_handover',     label: 'Manager: Confirm handover and knowledge transfer',    tool: null,               manual: true,  actor: 'manager', blocking: true  },
  { key: 'transfer_drive_files',      label: 'Transfer Google Drive files',                         tool: 'google_workspace', manual: false, actor: 'it',      blocking: false },
  { key: 'suspend_google_account',    label: 'Suspend Google Workspace account',                    tool: 'google_workspace', manual: false, actor: 'it',      blocking: false },
  { key: 'revoke_google_voice',       label: 'Revoke Google Voice license',                         tool: 'google_voice',     manual: false, actor: 'it',      blocking: false },
  { key: 'revoke_github_access',      label: 'Revoke GitHub access',                                tool: 'github',           manual: false, actor: 'it',      blocking: false },
  { key: 'deactivate_timedoctor',     label: 'Deactivate Time Doctor user',                         tool: 'timedoctor',       manual: false, actor: 'it',      blocking: false },
  { key: 'revoke_hubspot',            label: 'Revoke HubSpot access',                               tool: 'hubspot',          manual: false, actor: 'it',      blocking: false },
  { key: 'lock_devices_scalefusion',  label: 'Lock devices in ScaleFusion MDM',                     tool: null,               manual: false, actor: 'it',      blocking: false },
  { key: 'deactivate_slack',          label: 'Deactivate Slack account',                            tool: 'slack',            manual: false, actor: 'it',      blocking: false },
  { key: 'gate_it_device_return',     label: 'IT: Confirm device returned and wiped',               tool: null,               manual: true,  actor: 'it',      blocking: true  },
  { key: 'gate_hr_exit',              label: 'HR: Confirm exit interview and final paycheck',        tool: null,               manual: true,  actor: 'hr',      blocking: true  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getStepsForProcess(process, allSteps) {
  const tools = new Set(process.tools ?? ['google_workspace']);
  return allSteps.filter((s) => s.tool === null || tools.has(s.tool));
}

export function isManualStep(stepKey) {
  const all = [...ALL_ONBOARDING_STEPS, ...ALL_OFFBOARDING_STEPS];
  return all.find((s) => s.key === stepKey)?.manual ?? false;
}

export function isBlockingStep(stepKey) {
  const all = [...ALL_ONBOARDING_STEPS, ...ALL_OFFBOARDING_STEPS];
  return all.find((s) => s.key === stepKey)?.blocking ?? false;
}

export function getStepActor(stepKey) {
  const all = [...ALL_ONBOARDING_STEPS, ...ALL_OFFBOARDING_STEPS];
  return all.find((s) => s.key === stepKey)?.actor ?? null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Step Executors ────────────────────────────────────────────────────────────

export const stepExecutors = {
  // 9.1 Google Workspace — crea cuenta y asigna licencia Workspace
  async create_google_account(process) {
    const result = await googleWorkspace.createUser({
      firstName:  process.first_name ?? process.employee_name.split(' ')[0],
      lastName:   process.last_name  ?? process.employee_name.split(' ').slice(1).join(' '),
      email:      process.employee_email,
      department: process.department,
      title:      process.role_title,
    });

    if (result.skipped) return result;

    // Google necesita unos segundos para propagar el usuario antes de aceptar
    // la asignación de licencia en la Licensing API.
    const delayMs = appConfig.google.licenseDelayMs;
    logger.info(`Waiting ${delayMs}ms before assigning Workspace license`, { email: process.employee_email });
    await sleep(delayMs);

    const licenseResult = await googleWorkspace.assignWorkspaceLicense(process.employee_email);
    return { ...result, workspaceLicense: licenseResult };
  },

  // 9.2 Drive folder (inside GSD Onboarding parent folder)
  async create_drive_folder(process) {
    return googleWorkspace.createDriveFolder(
      `Onboarding — ${process.employee_name}`,
      appConfig.google.onboardingDriveFolderId
    );
  },

  async transfer_drive_files(process) {
    if (!process.file_transfer_to) return { skipped: true, reason: 'No transfer recipient specified' };
    return googleWorkspace.transferDriveFiles(
      process.employee_email,
      `transfer-target@${appConfig.google.domain ?? 'gsdoutsources.com'}`
    );
  },

  async suspend_google_account(process) {
    return googleWorkspace.suspendUser(process.employee_email);
  },

  // 9.3 Google Voice — espera el delay antes de asignar (puede correr cerca de
  // la creación de cuenta si create_drive_folder fue muy rápido)
  async assign_google_voice(process) {
    const delayMs = appConfig.google.licenseDelayMs;
    logger.info(`Waiting ${delayMs}ms before assigning Voice license`, { email: process.employee_email });
    await sleep(delayMs);
    return googleVoice.assignLicense(process.employee_email);
  },

  async revoke_google_voice(process) {
    return googleVoice.revokeLicense(process.employee_email);
  },

  // 9.4 Slack
  async invite_slack_user(process, client) {
    return slackIntegration.inviteUserToWorkspace(client, process.employee_email);
  },

  async invite_slack_channels(process, client) {
    if (!process.employee_slack) return { skipped: true, reason: 'Employee Slack ID not yet available' };
    const channels = process.channels ?? [];
    if (channels.length === 0) return { skipped: true, reason: 'No channels specified' };
    return slackIntegration.inviteToChannels(client, process.employee_slack, channels);
  },

  async send_welcome_dm(process, client) {
    if (!process.employee_slack) return { skipped: true, reason: 'Employee Slack ID not yet available' };
    return slackIntegration.sendWelcomeDm(client, process.employee_slack, process);
  },

  async deactivate_slack(process, client) {
    return slackIntegration.deactivateUser(client, process.employee_slack);
  },

  // 9.5 Time Doctor
  async create_timedoctor_user(process) {
    return timedoctor.createUser({
      name:      process.employee_name,
      email:     process.employee_email,
      roleTitle: process.role_title,
    });
  },

  async deactivate_timedoctor(process) {
    return timedoctor.deactivateUser(process.employee_email);
  },

  // 9.6 BUK
  async validate_buk(process) {
    return buk.validateEmployee(process.employee_email);
  },

  // 9.7.1 Notify IT
  async notify_it_equipment(process, client) {
    const itChannel = appConfig.channels.it;
    if (!itChannel) return { skipped: true, reason: 'IT_CHANNEL_ID not configured' };

    await client.chat.postMessage({
      channel: itChannel,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: ':computer: New Hire — Verify Equipment', emoji: true } },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Employee:*\n${process.employee_name}` },
            { type: 'mrkdwn', text: `*Role:*\n${process.role_title ?? '—'}` },
            { type: 'mrkdwn', text: `*Department:*\n${process.department ?? '—'}` },
            { type: 'mrkdwn', text: `*Start date:*\n${process.start_date ?? '—'}` },
          ],
        },
        { type: 'section', text: { type: 'mrkdwn', text: ':arrow_right: Please verify equipment availability and confirm below.' } },
        {
          type: 'actions',
          block_id: `it_equipment_${process.id}`,
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: ':white_check_mark: Equipment Available', emoji: true },
              style: 'primary',
              action_id: 'gate_it_equipment_available',
              value: String(process.id),
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: ':package: No Stock — Request Vendor Quote', emoji: true },
              style: 'danger',
              action_id: 'gate_it_no_equipment',
              value: String(process.id),
            },
          ],
        },
      ],
      text: `New hire ${process.employee_name} — verify equipment availability.`,
    });

    logger.info('IT equipment notification sent', { processId: process.id });
    return { success: true };
  },

  // 9.7.2 Notify Finance
  async notify_finance(process, client) {
    const financeChannel = appConfig.channels.finance;
    if (!financeChannel) return { skipped: true, reason: 'FINANCE_CHANNEL_ID not configured' };

    await client.chat.postMessage({
      channel: financeChannel,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: ':dollar: New Hire — Create in Payment System', emoji: true } },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Employee:*\n${process.employee_name}` },
            { type: 'mrkdwn', text: `*Corporate email:*\n${process.employee_email}` },
            { type: 'mrkdwn', text: `*Role:*\n${process.role_title ?? '—'}` },
            { type: 'mrkdwn', text: `*Department:*\n${process.department ?? '—'}` },
            { type: 'mrkdwn', text: `*Client:*\n${process.client_name ?? 'GSD'}` },
            { type: 'mrkdwn', text: `*Start date:*\n${process.start_date ?? '—'}` },
          ],
        },
        { type: 'section', text: { type: 'mrkdwn', text: ':arrow_right: Please create this employee in the payment system and confirm when done.' } },
        {
          type: 'actions',
          block_id: `finance_payroll_${process.id}`,
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: ':white_check_mark: Payroll Configured', emoji: true },
              style: 'primary',
              action_id: 'gate_finance_payroll_done',
              value: String(process.id),
            },
          ],
        },
      ],
      text: `New hire ${process.employee_name} — create in payment system.`,
    });

    logger.info('Finance notification sent', { processId: process.id });
    return { success: true };
  },

  // 9.7.3 Notify Account Manager
  async notify_account_manager(process, client) {
    const amChannel = appConfig.channels.accountManager;
    if (!amChannel) {
      if (process.manager_slack) {
        await client.chat.postMessage({
          channel: process.manager_slack,
          text: `:mega: New hire confirmed: *${process.employee_name}* starts on *${process.start_date ?? 'TBD'}* as *${process.role_title ?? '—'}*. Process #${process.id}`,
        });
        return { success: true, fallback: 'manager_dm' };
      }
      return { skipped: true, reason: 'ACCOUNT_MANAGER_CHANNEL_ID not configured' };
    }

    await client.chat.postMessage({
      channel: amChannel,
      text: `:mega: *New hire:* ${process.employee_name} | Role: ${process.role_title ?? '—'} | Client: ${process.client_name ?? 'GSD'} | Start: ${process.start_date ?? '—'} | Process #${process.id}`,
    });

    logger.info('Account Manager notification sent', { processId: process.id });
    return { success: true };
  },

  // 9.7.4 Notify HR that all notifications were sent
  async notify_hr_notifications_done(process, client) {
    const hrChannel = appConfig.channels.hr ?? process.slack_channel;
    if (!hrChannel) return { skipped: true, reason: 'HR_CHANNEL_ID not configured' };

    await client.chat.postMessage({
      channel: hrChannel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:bell: *Notifications sent* for *${process.employee_name}*'s onboarding.\n\n` +
              `• :computer: IT notified to verify equipment\n` +
              `• :dollar: Finance notified to set up payroll\n` +
              `• :mega: Account Manager notified of new hire\n\n` +
              `Please confirm all responsible parties have acknowledged.`,
          },
        },
        {
          type: 'actions',
          block_id: `hr_verify_notifs_${process.id}`,
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: ':white_check_mark: Confirmed — All Notified', emoji: true },
              style: 'primary',
              action_id: 'gate_hr_verify_notifications_done',
              value: String(process.id),
            },
          ],
        },
      ],
      text: `Notifications sent for ${process.employee_name}'s onboarding. Please confirm receipt.`,
    });

    return { success: true };
  },

  // GitHub
  async invite_github_org(process) {
    if (!process.github_username) return { skipped: true, reason: 'No GitHub username provided' };
    return github.inviteToOrg(process.github_username);
  },

  async assign_github_repos(process) {
    if (!process.github_username) return { skipped: true, reason: 'No GitHub username provided' };
    const repos = process.repos ?? [];
    if (repos.length === 0) return { skipped: true, reason: 'No repos specified' };
    return github.assignRepos(process.github_username, repos);
  },

  async revoke_github_access(process) {
    if (!process.github_username) return { skipped: true, reason: 'No GitHub username' };
    return github.revokeAccess(process.github_username);
  },

  // HubSpot
  async invite_hubspot_user(process) {
    const [firstName, ...rest] = process.employee_name.split(' ');
    return hubspot.inviteUser({
      firstName,
      lastName:  rest.join(' ') || firstName,
      email:     process.employee_email,
      roleTitle: process.role_title,
      department: process.department,
    });
  },

  async revoke_hubspot(process) {
    return hubspot.deactivateUser(process.employee_email);
  },

  // ScaleFusion MDM
  async send_scalefusion_enrollment(process) {
    return scalefusion.sendEnrollmentInvite(process.employee_email);
  },

  async lock_devices_scalefusion(process) {
    return scalefusion.offboardEmployee(process.employee_email);
  },

  // Manager notifications
  async notify_manager(process, client) {
    return slackIntegration.sendManagerNotification(client, process.manager_slack, process, 'onboarding');
  },

  async notify_manager_offboard(process, client) {
    return slackIntegration.sendManagerNotification(client, process.manager_slack, process, 'offboarding');
  },
};
