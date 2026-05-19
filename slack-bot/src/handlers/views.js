import { startOnboarding }  from '../workflows/onboarding.js';
import { startOffboarding } from '../workflows/offboarding.js';
import { googleWorkspace }  from '../integrations/google.js';
import { DepartmentRepository } from '../repositories/DepartmentRepository.js';
import { RoleTitleRepository } from '../repositories/RoleTitleRepository.js';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

const deptRepo = new DepartmentRepository();
const roleRepo = new RoleTitleRepository();

/**
 * Extracts a single-value input from Slack's view state values.
 */
function extractValue(values, blockId) {
  const block = values[blockId];
  if (!block) return null;
  const action = Object.values(block)[0];
  if (!action) return null;

  if (action.type === 'plain_text_input') return action.value ?? null;
  if (action.selected_option) return action.selected_option.value;
  if (action.selected_user) return action.selected_user;
  if (action.selected_date) return action.selected_date;
  if (action.selected_channels) return action.selected_channels;
  if (action.selected_options) return action.selected_options.map((o) => o.value);
  return null;
}

/**
 * Normalizes a name segment for email generation:
 * lowercase, remove accents, remove non-alphanumeric chars.
 * "María" → "maria", "O'Brien" → "obrien"
 */
function normalizeForEmail(str) {
  return (str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');       // keep only a-z 0-9
}

/**
 * Builds the corporate email from first name and last name.
 * Rule: first_name.first_last_name@domain
 * "Jane Doe García" → "jane.doe@gsdoutsources.com"
 */
function buildCorporateEmail(firstName, lastName) {
  const domain = appConfig.companyEmailDomain ?? 'gsdoutsources.com';
  const first = normalizeForEmail(firstName.trim().split(/\s+/)[0]);
  const last  = normalizeForEmail(lastName.trim().split(/\s+/)[0]);
  return `${first}.${last}@${domain}`;
}

/**
 * Validates password complexity.
 * Rules: ≥8 chars, at least 1 uppercase, 1 lowercase, 1 digit.
 * @returns {string|null} Error message or null if valid.
 */
function validatePassword(password) {
  if (!password || password.length < 8)   return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password))            return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(password))            return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(password))            return 'Password must include at least one number.';
  return null;
}

export function registerViews(app) {
  // ── IT-initiated password reset — employee submits new password ──────────────
  app.view('modal_it_password_reset_submit', async ({ ack, view, body, client }) => {
    const values = view.state.values;
    const { email, itUserId } = JSON.parse(view.private_metadata ?? '{}');

    const newPassword     = extractValue(values, 'new_password')     ?? '';
    const confirmPassword = extractValue(values, 'confirm_password') ?? '';

    // Validate inline
    const errors = {};
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      errors.new_password = pwdError;
    } else if (newPassword !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      await ack({ response_action: 'errors', errors });
      return;
    }

    await ack();

    try {
      const result = await googleWorkspace.changeUserPassword(email, newPassword);

      if (result?.skipped) {
        await client.chat.postMessage({
          channel: body.user.id,
          text: `:warning: Password change skipped: ${result.reason ?? 'Google Workspace not configured'}. Contact IT.`,
        });
        return;
      }

      logger.info('IT-initiated password reset completed', { email, by: body.user.id });

      // Confirm to the employee
      await client.chat.postMessage({
        channel: body.user.id,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':white_check_mark: *Your GSD password has been updated successfully!*\n\nYou can now use your new password across all GSD tools (Gmail, Drive, etc.).',
            },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `Account: \`${email}\` — If you didn't do this, contact IT immediately.` },
            ],
          },
        ],
        text: `Your GSD password has been updated for ${email}.`,
      });

      // Notify IT agent that the employee completed the reset
      if (itUserId) {
        await client.chat.postMessage({
          channel: itUserId,
          text: `:white_check_mark: *Password reset completed*\n<@${body.user.id}> has successfully set a new password for \`${email}\`.`,
        });
      }

    } catch (err) {
      logger.error('IT password reset submission failed', { error: err.message, email });
      await client.chat.postMessage({
        channel: body.user.id,
        text: `:x: *Failed to update your password.*\nError: ${err.message}\n\nPlease contact IT support.`,
      });
    }
  });

  // ── /gsdaccount — password change submission ─────────────────────────────────
  app.view('modal_change_password_submit', async ({ ack, view, body, client }) => {
    const values = view.state.values;
    const { email } = JSON.parse(view.private_metadata ?? '{}');

    const newPassword     = extractValue(values, 'new_password')     ?? '';
    const confirmPassword = extractValue(values, 'confirm_password') ?? '';

    // ── Validate inline (response_action: 'errors' shows errors in the modal) ──
    const errors = {};

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      errors.new_password = pwdError;
    } else if (newPassword !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      await ack({ response_action: 'errors', errors });
      return;
    }

    await ack();

    // ── Change password via Google Admin SDK ────────────────────────────────────
    try {
      const result = await googleWorkspace.changeUserPassword(email, newPassword);

      if (result?.skipped) {
        await client.chat.postMessage({
          channel: body.user.id,
          text: `:warning: Password change skipped: ${result.reason ?? 'Google Workspace not configured'}. Contact IT.`,
        });
        return;
      }

      logger.info('Password changed via /gsdaccount', { email });
      await client.chat.postMessage({
        channel: body.user.id,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':white_check_mark: *Password updated successfully!*',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Account: \`${email}\` — If you didn't request this change, contact IT immediately.`,
              },
            ],
          },
        ],
        text: `Password updated for ${email}`,
      });
    } catch (err) {
      logger.error('Failed to change password via /gsdaccount', { error: err.message, email });
      await client.chat.postMessage({
        channel: body.user.id,
        text: `:x: *Failed to update password.*\nError: ${err.message}\n\nPlease contact IT support.`,
      });
    }
  });

  // ── Onboarding modal submission ──────────────────────────────────────────────
  app.view('modal_onboarding_submit', async ({ ack, view, body, client }) => {
    await ack();

    const values = view.state.values;

    const rawClient  = extractValue(values, 'client_name');
    const firstName  = (extractValue(values, 'first_name') ?? '').trim();
    const lastName   = (extractValue(values, 'last_name')  ?? '').trim();
    const employeeName = `${firstName} ${lastName}`.trim();

    // Department: prefer new_department text over the select
    const deptSelect = extractValue(values, 'department');
    const deptNew    = (extractValue(values, 'new_department') ?? '').trim();
    let department = deptNew || deptSelect || null;

    // Persist new department to DB so it appears in future searches
    if (deptNew) {
      try { deptRepo.findOrCreate(deptNew); } catch (_) {}
    }

    // Role title: prefer new_role_title text over the select
    const roleSelect = extractValue(values, 'role_title');
    const roleNew    = (extractValue(values, 'new_role_title') ?? '').trim();
    let roleTitle = roleNew || roleSelect || null;

    // Persist new role title to DB
    if (roleNew) {
      try { roleRepo.findOrCreate(roleNew); } catch (_) {}
    }

    const formData = {
      clientName:    rawClient?.trim() || appConfig.companyName || 'GSD',
      firstName,
      lastName,
      employeeName,
      // email is computed — never user-supplied for onboarding
      employeeEmail: buildCorporateEmail(firstName, lastName),
      startDate:     extractValue(values, 'start_date'),
      department,
      roleTitle,
      manager:       extractValue(values, 'manager'),
      githubUsername: extractValue(values, 'github_username'),
      slackChannels: extractValue(values, 'slack_channels') ?? [],
      tools: (() => {
        const selected = extractValue(values, 'tools') ?? [];
        return selected.includes('google_workspace') ? selected : ['google_workspace', ...selected];
      })(),
    };

    logger.info('Onboarding modal submitted', {
      employee: formData.employeeName,
      email: formData.employeeEmail,
      department: formData.department,
      role: formData.roleTitle,
    });

    setImmediate(async () => {
      try {
        await startOnboarding(formData, { client, body });
      } catch (err) {
        logger.error('Onboarding workflow failed', { error: err.message, stack: err.stack });
        try {
          await client.chat.postMessage({
            channel: body.user.id,
            text: `:x: Onboarding falló para *${formData.employeeName}*: ${err.message}`,
          });
        } catch (_) {}
      }
    });
  });

  // ── Offboarding modal submission ─────────────────────────────────────────────
  app.view('modal_offboarding_submit', async ({ ack, view, body, client }) => {
    await ack();

    const values = view.state.values;
    const rawClient = extractValue(values, 'client_name');
    const firstName = (extractValue(values, 'first_name') ?? '').trim();
    const lastName  = (extractValue(values, 'last_name')  ?? '').trim();
    const employeeName = `${firstName} ${lastName}`.trim();

    // For offboarding, email is manually entered (the existing corporate email)
    const employeeEmail = (extractValue(values, 'employee_email') ?? '').trim()
      || buildCorporateEmail(firstName, lastName);

    const formData = {
      clientName:        rawClient?.trim() || appConfig.companyName || 'GSD',
      firstName,
      lastName,
      employeeName,
      employeeEmail,
      lastDay:           extractValue(values, 'last_day'),
      manager:           extractValue(values, 'manager'),
      fileTransferTarget: extractValue(values, 'file_transfer_target'),
      offboardReason:    extractValue(values, 'offboard_reason'),
      tools: (() => {
        const selected = extractValue(values, 'tools') ?? [];
        return selected.includes('google_workspace') ? selected : ['google_workspace', ...selected];
      })(),
    };

    logger.info('Offboarding modal submitted', { employee: formData.employeeName });

    setImmediate(async () => {
      try {
        await startOffboarding(formData, { client, body });
      } catch (err) {
        logger.error('Offboarding workflow failed', { error: err.message, stack: err.stack });
        try {
          await client.chat.postMessage({
            channel: body.user.id,
            text: `:x: Offboarding falló para *${formData.employeeName}*: ${err.message}`,
          });
        } catch (_) {}
      }
    });
  });
}
