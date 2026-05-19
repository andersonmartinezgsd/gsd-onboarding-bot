import { buildOnboardingModal, buildOffboardingModal, buildChangePasswordModal } from '../blocks/modals.js';

/**
 * Parses the argument of /resetpassword.
 * Accepts:
 *   - Plain email:    anderson.martinez@gsdoutsources.com
 *   - Slack mention:  <@U12345ABC> or <@U12345ABC|firstname.lastname>
 *
 * @returns {{ type: 'email'|'slack_id', value: string } | null}
 */
function parseResetTarget(text) {
  const trimmed = (text ?? '').trim();
  const mentionMatch = trimmed.match(/^<@([A-Z0-9]+)(\|[^>]+)?>$/);
  if (mentionMatch) return { type: 'slack_id', value: mentionMatch[1] };
  if (trimmed.includes('@')) return { type: 'email', value: trimmed };
  return null;
}
import { logger } from '../utils/logger.js';
import { appConfig } from '../config/index.js';

/**
 * Verifica si el usuario y canal tienen permiso para usar comandos HR.
 * Retorna null si OK, o un string con el mensaje de error.
 */
function checkAccess(body) {
  const { authorizedUserIds, authorizedChannelId } = appConfig.access;

  if (authorizedChannelId && body.channel_id !== authorizedChannelId) {
    return `⛔ Este comando solo puede usarse desde <#${authorizedChannelId}>. Contacta a HR.`;
  }
  if (authorizedUserIds.length > 0 && !authorizedUserIds.includes(body.user_id)) {
    return `⛔ No tienes permiso para usar este comando. Contacta al equipo de HR.`;
  }
  return null;
}

export function registerCommands(app) {
  // /onboard — open onboarding modal
  app.command('/onboard', async ({ ack, client, body, respond }) => {
    await ack();
    const denied = checkAccess(body);
    if (denied) {
      await respond({ response_type: 'ephemeral', text: denied });
      return;
    }
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildOnboardingModal(),
      });
    } catch (err) {
      logger.error('Failed to open onboarding modal', { error: err.message });
    }
  });

  // /offboard — open offboarding modal
  app.command('/offboard', async ({ ack, client, body, respond }) => {
    await ack();
    const denied = checkAccess(body);
    if (denied) {
      await respond({ response_type: 'ephemeral', text: denied });
      return;
    }
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildOffboardingModal(),
      });
    } catch (err) {
      logger.error('Failed to open offboarding modal', { error: err.message });
    }
  });

  // /resetpassword — IT-initiated password reset sent as DM to the employee
  // Usage: /resetpassword @mention  OR  /resetpassword email@domain.com
  app.command('/resetpassword', async ({ ack, client, body, respond }) => {
    await ack();

    // Only authorized IT users can trigger this
    const denied = checkAccess(body);
    if (denied) {
      await respond({ response_type: 'ephemeral', text: denied });
      return;
    }

    const target = parseResetTarget(body.text);
    if (!target) {
      await respond({
        response_type: 'ephemeral',
        text: ':x: Usage: `/resetpassword @username`  or  `/resetpassword email@gsdoutsources.com`',
      });
      return;
    }

    try {
      let slackUserId;
      let corporateEmail;

      if (target.type === 'slack_id') {
        // Mentioned a Slack user — get their profile email
        const info = await client.users.info({ user: target.value });
        corporateEmail = info.user?.profile?.email ?? '';
        slackUserId    = target.value;
      } else {
        // Plain email — look up by email to get the Slack user ID
        const result = await client.users.lookupByEmail({ email: target.value });
        corporateEmail = target.value;
        slackUserId    = result.user?.id;
      }

      if (!corporateEmail) {
        await respond({ response_type: 'ephemeral', text: ':x: Could not find a corporate email for that user.' });
        return;
      }
      if (!slackUserId) {
        await respond({ response_type: 'ephemeral', text: `:x: No Slack account found for \`${corporateEmail}\`. They must be in this workspace.` });
        return;
      }

      const domain = appConfig.companyEmailDomain ?? 'gsdoutsources.com';
      if (!corporateEmail.endsWith(`@${domain}`)) {
        await respond({
          response_type: 'ephemeral',
          text: `:x: \`${corporateEmail}\` is not a *${domain}* account. Only corporate accounts can be reset here.`,
        });
        return;
      }

      // Get IT agent's display name for the DM
      const itInfo = await client.users.info({ user: body.user_id });
      const itName = itInfo.user?.real_name ?? itInfo.user?.name ?? 'IT';

      // Send DM to the employee with a button to open the password reset modal
      await client.chat.postMessage({
        channel: slackUserId,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:key: *Password Reset Request*\n\n*${itName}* from IT has requested that you set a new password for your GSD account:\n\`${corporateEmail}\`\n\nClick the button below to create your new password.`,
            },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: "If you didn't expect this, ignore this message and contact IT immediately." },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: '🔐 Set New Password', emoji: true },
                style: 'primary',
                action_id: 'it_password_reset_open_modal',
                value: JSON.stringify({ email: corporateEmail, itUserId: body.user_id }),
              },
            ],
          },
        ],
        text: `IT has requested you reset your password for ${corporateEmail}. Click the button to set a new one.`,
      });

      // Confirm to IT (ephemeral)
      await respond({
        response_type: 'ephemeral',
        text: `:white_check_mark: Password reset request sent to *${corporateEmail}*. They'll receive a DM with a button to set their new password.`,
      });

      logger.info('IT password reset request sent', { targetEmail: corporateEmail, requestedBy: body.user_id });

    } catch (err) {
      logger.error('/resetpassword failed', { error: err.message });
      // users.lookupByEmail returns error when user not found
      if (err.data?.error === 'users_not_found') {
        await respond({ response_type: 'ephemeral', text: `:x: No Slack account found for that email. Make sure they are in this workspace.` });
        return;
      }
      await respond({ response_type: 'ephemeral', text: `:x: Something went wrong: ${err.message}` });
    }
  });

  // /gsdaccount — self-service password change
  // Any employee can use this — no HR-access check needed (they only change their own password)
  app.command('/gsdaccount', async ({ ack, client, body, respond }) => {
    await ack();
    try {
      // Resolve the Slack user's email to determine their corporate account
      const userInfo = await client.users.info({ user: body.user_id });
      const profileEmail = userInfo.user?.profile?.email ?? '';

      if (!profileEmail) {
        await respond({
          response_type: 'ephemeral',
          text: ':x: Your Slack profile does not have an email set. Please contact IT.',
        });
        return;
      }

      const domain = appConfig.companyEmailDomain ?? 'gsdoutsources.com';
      if (!profileEmail.endsWith(`@${domain}`)) {
        await respond({
          response_type: 'ephemeral',
          text: `:x: Your Slack email (\`${profileEmail}\`) is not a *${domain}* account. Contact IT if you need help.`,
        });
        return;
      }

      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildChangePasswordModal(profileEmail),
      });
    } catch (err) {
      logger.error('Failed to open /gsdaccount modal', { error: err.message });
      await respond({
        response_type: 'ephemeral',
        text: ':x: Could not open the password change form. Try again or contact IT.',
      });
    }
  });

  // /hr-status — list active processes
  app.command('/hr-status', async ({ ack, respond }) => {
    await ack();
    try {
      const { ProcessRepository } = await import('../repositories/ProcessRepository.js');
      const { StepRepository } = await import('../repositories/StepRepository.js');
      const repo = new ProcessRepository();
      const stepRepo = new StepRepository();

      const active = [
        ...repo.findByStatus('pending'),
        ...repo.findByStatus('in_progress'),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (active.length === 0) {
        await respond({ text: 'No active onboarding/offboarding processes.' });
        return;
      }

      const lines = active.map((p) => {
        const steps = stepRepo.findAllForProcess(p.id);
        const done = steps.filter((s) => s.status === 'completed').length;
        const type = p.process_type === 'onboarding' ? ':green_heart: Onboarding' : ':wave: Offboarding';
        return `• ${type} *${p.employee_name}* — ${done}/${steps.length} steps | Status: ${p.status} | #${p.id}`;
      });

      await respond({
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: `*Active HR Processes (${active.length})*\n\n${lines.join('\n')}` } },
        ],
        text: `${active.length} active processes`,
      });
    } catch (err) {
      logger.error('Failed to fetch HR status', { error: err.message });
      await respond({ text: 'Failed to fetch status. Check bot logs.' });
    }
  });
}
