// Modal Block Kit views for data collection
import { TOOL_META, ALL_TOOLS, getDefaultTools } from '../config/roles.js';
import { appConfig } from '../config/index.js';

function buildToolsBlock(defaultTools = ['google_workspace']) {
  const defaultSet = new Set(defaultTools);
  return {
    type: 'input',
    block_id: 'tools',
    label: { type: 'plain_text', text: 'Tools to provision' },
    hint:  { type: 'plain_text', text: "Select tools based on the employee's profile." },
    element: {
      type: 'checkboxes',
      action_id: 'value',
      options: ALL_TOOLS.map((toolKey) => {
        const meta = TOOL_META[toolKey];
        const opt = {
          text:  { type: 'mrkdwn', text: `:${meta.emoji}: *${meta.label}*\n${meta.description}` },
          value: toolKey,
        };
        if (meta.required) opt.description = { type: 'plain_text', text: 'Required' };
        return opt;
      }),
      initial_options: ALL_TOOLS
        .filter((t) => defaultSet.has(t))
        .map((toolKey) => {
          const meta = TOOL_META[toolKey];
          const opt = {
            text:  { type: 'mrkdwn', text: `:${meta.emoji}: *${meta.label}*\n${meta.description}` },
            value: toolKey,
          };
          if (meta.required) opt.description = { type: 'plain_text', text: 'Required' };
          return opt;
        }),
    },
  };
}

export function buildOnboardingModal(department = null, roleTitle = null) {
  const defaultTools = getDefaultTools(department, roleTitle);
  const domain = appConfig.companyEmailDomain ?? 'gsdoutsources.com';

  return {
    type: 'modal',
    callback_id: 'modal_onboarding_submit',
    title:  { type: 'plain_text', text: 'New Onboarding' },
    submit: { type: 'plain_text', text: 'Start Onboarding' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':wave: Fill in the details below to kick off the onboarding process. Automated steps will run immediately.',
        },
      },
      { type: 'divider' },

      // Client
      {
        type: 'input',
        block_id: 'client_name',
        label: { type: 'plain_text', text: 'Client / Company' },
        hint:  { type: 'plain_text', text: 'Search the client. For internal staff, select GSD.' },
        element: {
          type: 'external_select',
          action_id: 'client_name_search',
          placeholder: { type: 'plain_text', text: 'Search client...' },
          min_query_length: 0,
          initial_option: {
            text:  { type: 'plain_text', text: `${appConfig.companyName ?? 'GSD'} (No client)` },
            value: appConfig.companyName ?? 'GSD',
          },
        },
      },

      // First Name / Last Name
      {
        type: 'input',
        block_id: 'first_name',
        label: { type: 'plain_text', text: 'First Name' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Jane' },
        },
      },
      {
        type: 'input',
        block_id: 'last_name',
        label: { type: 'plain_text', text: 'Last Name(s)' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Doe García' },
        },
      },

      // Auto-generated email notice
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `:email: *Corporate email* will be generated automatically as *first_name.last_name@${domain}*\n_e.g. jane.doe@${domain}_`,
          },
        ],
      },

      // Start Date
      {
        type: 'input',
        block_id: 'start_date',
        label: { type: 'plain_text', text: 'Start Date' },
        element: {
          type: 'datepicker',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Select date' },
        },
      },

      // Department (dynamic + create new)
      {
        type: 'input',
        block_id: 'department',
        label: { type: 'plain_text', text: 'Department' },
        hint:  { type: 'plain_text', text: "Search department. If it doesn't exist, type it in the field below." },
        element: {
          type: 'external_select',
          action_id: 'department_search',
          placeholder: { type: 'plain_text', text: 'Search department...' },
          min_query_length: 0,
        },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'new_department',
        label: { type: 'plain_text', text: 'New department (if not in list)' },
        hint:  { type: 'plain_text', text: 'Will be saved for future use.' },
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'e.g. Customer Experience' },
        },
      },

      // Role / Job Title (dynamic + create new)
      {
        type: 'input',
        block_id: 'role_title',
        label: { type: 'plain_text', text: 'Role / Job Title' },
        hint:  { type: 'plain_text', text: "Search role. If it doesn't exist, type it below." },
        element: {
          type: 'external_select',
          action_id: 'role_title_search',
          placeholder: { type: 'plain_text', text: 'Search role...' },
          min_query_length: 0,
        },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'new_role_title',
        label: { type: 'plain_text', text: 'New role (if not in list)' },
        hint:  { type: 'plain_text', text: 'Will be saved for future use.' },
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'e.g. Revenue Operations Analyst' },
        },
      },

      // Manager (admins only)
      {
        type: 'input',
        block_id: 'manager',
        label: { type: 'plain_text', text: 'Direct Manager' },
        hint:  { type: 'plain_text', text: 'Only workspace admin users are shown.' },
        element: {
          type: 'external_select',
          action_id: 'manager_search',
          placeholder: { type: 'plain_text', text: 'Search manager...' },
          min_query_length: 0,
        },
      },

      // GitHub (optional)
      {
        type: 'input',
        block_id: 'github_username',
        label: { type: 'plain_text', text: 'GitHub Username' },
        hint:  { type: 'plain_text', text: 'Leave blank to skip GitHub setup.' },
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'janedoe' },
        },
      },

      // Slack channels
      {
        type: 'input',
        block_id: 'slack_channels',
        label: { type: 'plain_text', text: 'Add to Slack Channels' },
        hint:  { type: 'plain_text', text: 'Channels the new employee should join.' },
        optional: true,
        element: {
          type: 'multi_channels_select',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Select channels' },
        },
      },

      { type: 'divider' },
      buildToolsBlock(defaultTools),
    ],
  };
}

export function buildOffboardingModal() {
  return {
    type: 'modal',
    callback_id: 'modal_offboarding_submit',
    title:  { type: 'plain_text', text: 'New Offboarding' },
    submit: { type: 'plain_text', text: 'Start Offboarding' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':wave: Fill in the details below to start the offboarding process. Access revocation will happen according to the schedule.',
        },
      },
      { type: 'divider' },

      {
        type: 'input',
        block_id: 'client_name',
        label: { type: 'plain_text', text: 'Client / Company' },
        element: {
          type: 'external_select',
          action_id: 'client_name_search',
          placeholder: { type: 'plain_text', text: 'Search client...' },
          min_query_length: 0,
          initial_option: {
            text:  { type: 'plain_text', text: `${appConfig.companyName ?? 'GSD'} (No client)` },
            value: appConfig.companyName ?? 'GSD',
          },
        },
      },
      {
        type: 'input',
        block_id: 'first_name',
        label: { type: 'plain_text', text: 'First Name' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'John' },
        },
      },
      {
        type: 'input',
        block_id: 'last_name',
        label: { type: 'plain_text', text: 'Last Name(s)' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Smith' },
        },
      },
      {
        type: 'input',
        block_id: 'employee_email',
        label: { type: 'plain_text', text: 'Corporate Email' },
        hint:  { type: 'plain_text', text: 'Email address to be suspended.' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'john.smith@gsdoutsources.com' },
        },
      },
      {
        type: 'input',
        block_id: 'last_day',
        label: { type: 'plain_text', text: 'Last Working Day' },
        element: {
          type: 'datepicker',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Select date' },
        },
      },
      {
        type: 'input',
        block_id: 'manager',
        label: { type: 'plain_text', text: 'Direct Manager' },
        element: {
          type: 'external_select',
          action_id: 'manager_search',
          placeholder: { type: 'plain_text', text: 'Search manager...' },
          min_query_length: 0,
        },
      },
      {
        type: 'input',
        block_id: 'file_transfer_target',
        label: { type: 'plain_text', text: 'Transfer Google Drive Files To' },
        hint:  { type: 'plain_text', text: 'Leave blank to skip Drive file transfer.' },
        optional: true,
        element: {
          type: 'users_select',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Select recipient' },
        },
      },
      {
        type: 'input',
        block_id: 'offboard_reason',
        label: { type: 'plain_text', text: 'Reason for Departure' },
        optional: true,
        element: {
          type: 'static_select',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Select reason' },
          options: [
            { text: { type: 'plain_text', text: 'Voluntary Resignation' }, value: 'resignation' },
            { text: { type: 'plain_text', text: 'Contract End' },          value: 'contract_end' },
            { text: { type: 'plain_text', text: 'Mutual Agreement' },      value: 'mutual' },
            { text: { type: 'plain_text', text: 'Termination' },           value: 'termination' },
            { text: { type: 'plain_text', text: 'Retirement' },            value: 'retirement' },
          ],
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: ':no_entry: *Access to revoke*\nSelect the tools this employee had access to.' },
      },
      buildToolsBlock(['google_workspace', 'slack', 'timedoctor']),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// /gsdaccount — self-service password change
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the "Change Account Password" modal.
 *
 * @param {string} email - Corporate email auto-detected from the Slack profile.
 *                         Stored in private_metadata so the view handler can use it.
 */
/**
 * Builds the password-reset modal sent to an employee after IT requests a reset.
 * callback_id differs from the self-service one so we can notify IT on submit.
 *
 * @param {string} email       - Corporate email of the employee
 * @param {string} itUserId    - Slack user ID of the IT agent who requested the reset
 */
export function buildPasswordResetModal(email, itUserId) {
  return {
    type: 'modal',
    callback_id: 'modal_it_password_reset_submit',
    private_metadata: JSON.stringify({ email, itUserId }),
    title:  { type: 'plain_text', text: 'Set New Password' },
    submit: { type: 'plain_text', text: 'Save Password' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:key: *Set a new password for your GSD account*\n\nAccount: \`${email}\``,
        },
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: ':warning: The text you type is visible. Use this from your own device.',
          },
        ],
      },
      {
        type: 'input',
        block_id: 'new_password',
        label: { type: 'plain_text', text: 'New Password' },
        hint:  { type: 'plain_text', text: 'Min 8 characters — uppercase, lowercase and at least one number.' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Enter your new password' },
        },
      },
      {
        type: 'input',
        block_id: 'confirm_password',
        label: { type: 'plain_text', text: 'Confirm Password' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Re-enter your new password' },
        },
      },
    ],
  };
}

export function buildChangePasswordModal(email) {
  return {
    type: 'modal',
    callback_id: 'modal_change_password_submit',
    private_metadata: JSON.stringify({ email }),
    title:  { type: 'plain_text', text: 'Change Password' },
    submit: { type: 'plain_text', text: 'Update Password' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:key: *Change your GSD account password*\n\nYour account: \`${email}\``,
        },
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: ':warning: The text you type is visible. Use this command from a private place.',
          },
        ],
      },
      {
        type: 'input',
        block_id: 'new_password',
        label: { type: 'plain_text', text: 'New Password' },
        hint:  { type: 'plain_text', text: 'Min 8 characters — uppercase, lowercase and at least one number.' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Enter new password' },
        },
      },
      {
        type: 'input',
        block_id: 'confirm_password',
        label: { type: 'plain_text', text: 'Confirm Password' },
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Re-enter new password' },
        },
      },
    ],
  };
}
