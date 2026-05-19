import { logger } from '../utils/logger.js';

/**
 * Slack integration helpers.
 * `client` is the Bolt WebClient instance passed from handlers/workflows.
 */

export const slackIntegration = {
  async inviteToChannels(client, userId, channelIds = []) {
    if (channelIds.length === 0) return { skipped: true };

    const results = [];
    for (const channelId of channelIds) {
      try {
        await client.conversations.invite({ channel: channelId, users: userId });
        results.push({ channelId, success: true });
        logger.info('User invited to channel', { userId, channelId });
      } catch (err) {
        // already_in_channel is not an error
        if (err.data?.error === 'already_in_channel') {
          results.push({ channelId, success: true, note: 'already_in_channel' });
        } else {
          logger.warn('Failed to invite user to channel', { userId, channelId, error: err.message });
          results.push({ channelId, success: false, error: err.message });
        }
      }
    }
    return { results };
  },

  async sendWelcomeDm(client, userId, process) {
    if (!userId) return { skipped: true };

    const startDate = process.start_date
      ? new Date(process.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'your start date';

    try {
      await client.chat.postMessage({
        channel: userId,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `Welcome to the team, ${process.employee_name.split(' ')[0]}!`, emoji: true },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hi ${process.employee_name.split(' ')[0]}! :wave:\n\nWe're so excited to have you join us on *${startDate}*. Your onboarding process has been kicked off and we're getting everything ready for you.`,
            },
          },
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Your onboarding details:*\n• *Role:* ${process.role_title ?? '—'}\n• *Department:* ${process.department ?? '—'}\n• *Manager:* ${process.manager_slack ? `<@${process.manager_slack}>` : '—'}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `If you have any questions before your start date, don't hesitate to reach out to your manager or HR.\n\n:rocket: We can't wait to see what you'll build with us!`,
            },
          },
        ],
        text: `Welcome to the team, ${process.employee_name}!`,
      });
      logger.info('Welcome DM sent', { userId });
      return { success: true };
    } catch (err) {
      logger.warn('Failed to send welcome DM', { userId, error: err.message });
      return { success: false, error: err.message };
    }
  },

  async sendManagerNotification(client, managerId, process, type = 'onboarding') {
    if (!managerId) return { skipped: true };

    const text =
      type === 'onboarding'
        ? `*Action Required:* A new onboarding process has been started for *${process.employee_name}* (${process.employee_email}).\n\nPlease ensure their workspace is set up before *${process.start_date ?? 'their start date'}*.\n\nProcess ID: #${process.id}`
        : `*Action Required:* An offboarding process has been started for *${process.employee_name}* (${process.employee_email}).\n\nLast day: *${process.last_day ?? 'TBD'}*. Please ensure knowledge transfer is completed.\n\nProcess ID: #${process.id}`;

    try {
      await client.chat.postMessage({
        channel: managerId,
        text,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text },
          },
        ],
      });
      logger.info('Manager notification sent', { managerId, processId: process.id });
      return { success: true };
    } catch (err) {
      logger.warn('Failed to send manager notification', { managerId, error: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Invites a user to the Slack workspace by email.
   * Requires the `admin.users:write` scope (available on paid plans).
   * Falls back gracefully on free workspaces — logs a warning instead of throwing.
   */
  async inviteUserToWorkspace(client, email) {
    if (!email) return { skipped: true, reason: 'Employee email not available' };

    try {
      await client.admin.users.invite({ email, channel_ids: [] });
      logger.info('Slack workspace invitation sent', { email });
      return { success: true, email };
    } catch (err) {
      // admin.users.invite requires Enterprise Grid or specific admin tokens.
      // On standard workspaces this is a manual step — we log but don't fail.
      logger.warn('Slack invitation requires admin scope; manual invite may be needed', { email, error: err.message });
      return {
        success: false,
        manualStepRequired: true,
        email,
        message: `Manually invite ${email} to the Slack workspace via Settings → Invite People.`,
      };
    }
  },

  async deactivateUser(client, userId) {
    if (!userId) return { skipped: true };
    try {
      // users.admin.setInactive is undocumented/proprietary or requires SCIM on Enterprise Grid.
      // On standard workspaces this is a manual step.
      logger.info('Slack user deactivation requested', { userId });
      return {
        success: true,
        manualStepRequired: true,
        message: 'Automatic Slack deactivation requires Enterprise Grid. Please deactivate the user manually in the Admin Panel.',
      };
    } catch (err) {
      logger.warn('Slack deactivation error', { userId, error: err.message });
      return { success: false, error: err.message };
    }
  },
};
