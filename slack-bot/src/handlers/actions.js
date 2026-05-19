import {
  completeManualStep as completeOnboardingStep,
  cancelProcess,
} from '../workflows/onboarding.js';
import {
  completeManualStep as completeOffboardingStep,
  revokeAllAccess,
} from '../workflows/offboarding.js';
import { ProcessRepository } from '../repositories/ProcessRepository.js';
import { buildPasswordResetModal } from '../blocks/modals.js';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

const processRepo = new ProcessRepository();

async function ackUser(client, body, text) {
  await client.chat.postEphemeral({
    channel: body.channel?.id ?? body.user.id,
    user:    body.user.id,
    text,
  });
}

export function registerActions(app) {

  // ── IT: employee clicks "Set New Password" button in their DM ────────────────
  app.action('it_password_reset_open_modal', async ({ ack, body, client, action }) => {
    await ack();
    try {
      const { email, itUserId } = JSON.parse(action.value ?? '{}');
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildPasswordResetModal(email, itUserId),
      });
    } catch (err) {
      logger.error('Failed to open IT password reset modal', { error: err.message });
    }
  });

  // ── HR: confirm all notifications received (9.7.4) ───────────────────────────
  app.action('gate_hr_verify_notifications_done', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('HR verified notifications', { processId, by: body.user.id });
    try {
      await completeOnboardingStep(processId, 'gate_hr_verify_notifications', client);
      await ackUser(client, body, `:white_check_mark: Notifications confirmed for process #${processId}`);
    } catch (err) {
      logger.error('gate_hr_verify_notifications_done failed', { processId, error: err.message });
    }
  });

  // ── IT: equipment available ───────────────────────────────────────────────────
  app.action('gate_it_equipment_available', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('IT: equipment available', { processId, by: body.user.id });
    try {
      processRepo.updateEquipmentStatus(processId, 'available');
      await completeOnboardingStep(processId, 'gate_it_equipment_available', client);
      await ackUser(client, body, `:white_check_mark: Equipment marked as available for process #${processId}`);
    } catch (err) {
      logger.error('gate_it_equipment_available failed', { processId, error: err.message });
    }
  });

  // ── IT: no stock — notify vendor ─────────────────────────────────────────────
  app.action('gate_it_no_equipment', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('IT: no equipment — notifying vendor', { processId, by: body.user.id });
    try {
      processRepo.updateEquipmentStatus(processId, 'vendor_requested');
      const process = processRepo.findById(processId);
      await notifyVendor(client, process);
      await ackUser(client, body, `:package: Vendor notified for quote. Process #${processId}`);
    } catch (err) {
      logger.error('gate_it_no_equipment failed', { processId, error: err.message });
    }
  });

  // ── IT: open shipping info modal ─────────────────────────────────────────────
  app.action('gate_device_shipped_confirm', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildShippingInfoModal(processId),
      });
    } catch (err) {
      logger.error('gate_device_shipped_confirm failed', { processId, error: err.message });
      await ackUser(client, body, `:x: Could not open shipping form: ${err.message}`);
    }
  });

  // ── HR / employee: device received ───────────────────────────────────────────
  app.action('gate_device_received_confirm', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('Device received confirmed', { processId, by: body.user.id });
    try {
      processRepo.updateEquipmentStatus(processId, 'received', { received_at: new Date().toISOString() });
      await completeOnboardingStep(processId, 'gate_device_received', client);
      const process = processRepo.findById(processId);
      await notifyDeviceReceived(client, process);
      await ackUser(client, body, `:white_check_mark: Device receipt confirmed for process #${processId}`);
    } catch (err) {
      logger.error('gate_device_received_confirm failed', { processId, error: err.message });
    }
  });

  // ── Finance: payroll done ─────────────────────────────────────────────────────
  app.action('gate_finance_payroll_done', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('Finance: payroll done', { processId, by: body.user.id });
    try {
      await completeOnboardingStep(processId, 'gate_finance_payroll', client);
      await ackUser(client, body, `:white_check_mark: Payroll confirmed for process #${processId}`);
    } catch (err) {
      logger.error('gate_finance_payroll_done failed', { processId, error: err.message });
    }
  });

  // ── HR: contracts signed ──────────────────────────────────────────────────────
  app.action('gate_hr_paperwork_done', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('HR: paperwork done', { processId, by: body.user.id });
    try {
      await completeOnboardingStep(processId, 'gate_hr_paperwork', client);
      await ackUser(client, body, `:white_check_mark: Documents confirmed for process #${processId}`);
    } catch (err) {
      logger.error('gate_hr_paperwork_done failed', { processId, error: err.message });
    }
  });

  // ── Manager: employee briefed ─────────────────────────────────────────────────
  app.action('gate_manager_confirm_done', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('Manager confirmed briefing', { processId, by: body.user.id });
    try {
      await completeOnboardingStep(processId, 'gate_manager_confirm', client);
      await ackUser(client, body, `:white_check_mark: Manager confirmation recorded for process #${processId}`);
    } catch (err) {
      logger.error('gate_manager_confirm_done failed', { processId, error: err.message });
    }
  });

  // ── Cancel onboarding ─────────────────────────────────────────────────────────
  app.action('onboarding_cancel', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('Onboarding cancelled', { processId, by: body.user.id });
    try {
      await cancelProcess(processId, client);
    } catch (err) {
      logger.error('Failed to cancel onboarding', { processId, error: err.message });
    }
  });

  // ── Shipping info modal submission ────────────────────────────────────────────
  app.view('modal_shipping_info_submit', async ({ ack, view, client }) => {
    await ack();
    const processId = parseInt(view.private_metadata, 10);
    const notes = view.state.values.shipping_notes?.value?.value ?? '';
    try {
      processRepo.updateEquipmentStatus(processId, 'shipped', {
        shipped_at: new Date().toISOString(),
        notes,
      });
      await completeOnboardingStep(processId, 'gate_device_shipped', client, { shippingNotes: notes });
      const process = processRepo.findById(processId);
      await notifyDeviceShipped(client, process, notes);
    } catch (err) {
      logger.error('Shipping info submission failed', { processId, error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // OFFBOARDING
  // ═══════════════════════════════════════════════════════════════════════════

  app.action('offboarding_hardware_confirmed', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('Hardware return confirmed', { processId, by: body.user.id });
    try {
      await completeOffboardingStep(processId, 'gate_it_device_return', client);
      await ackUser(client, body, `:white_check_mark: Device return confirmed for process #${processId}`);
    } catch (err) {
      logger.error('Failed to confirm hardware return', { processId, error: err.message });
    }
  });

  app.action('offboarding_exit_done', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('Exit interview marked done', { processId, by: body.user.id });
    try {
      await completeOffboardingStep(processId, 'gate_hr_exit', client);
      await ackUser(client, body, `:white_check_mark: Exit interview confirmed for process #${processId}`);
    } catch (err) {
      logger.error('Failed to mark exit interview done', { processId, error: err.message });
    }
  });

  app.action('offboarding_revoke_all', async ({ ack, body, client, action }) => {
    await ack();
    const processId = parseInt(action.value, 10);
    logger.info('All access revocation requested', { processId, by: body.user.id });
    try {
      await revokeAllAccess(processId, client);
      await ackUser(client, body, `:no_entry: Access revocation initiated for process #${processId}`);
    } catch (err) {
      logger.error('Failed to revoke access', { processId, error: err.message });
    }
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function notifyVendor(client, process) {
  const vendorChannel = appConfig.vendor.channelId;
  if (!vendorChannel) {
    logger.warn('VENDOR_CHANNEL_ID not configured — skipping vendor notification', { processId: process.id });
    return;
  }
  await client.chat.postMessage({
    channel: vendorChannel,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: ':package: Equipment Quote Request', emoji: true } },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `We have no available equipment in stock for the following new hire:\n\n` +
            `• *Employee:* ${process.employee_name}\n` +
            `• *Role:* ${process.role_title ?? '—'}\n` +
            `• *Start date:* ${process.start_date ?? '—'}\n\n` +
            `Please send a quote as soon as possible to continue the onboarding process.`,
        },
      },
    ],
    text: `Equipment quote request for ${process.employee_name} — no stock available.`,
  });
}

async function notifyDeviceShipped(client, process, notes) {
  const hrChannel = process.slack_channel ?? appConfig.channels.hr;
  if (!hrChannel) return;
  await client.chat.postMessage({
    channel: hrChannel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:truck: *Device shipped* for *${process.employee_name}* (Process #${process.id})\n\n` +
            (notes ? `*Shipping guide / notes:*\n${notes}\n\n` : '') +
            `Please confirm once the device is received.`,
        },
      },
      {
        type: 'actions',
        block_id: `device_received_${process.id}`,
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: ':white_check_mark: Device Received', emoji: true },
            style: 'primary',
            action_id: 'gate_device_received_confirm',
            value: String(process.id),
          },
        ],
      },
    ],
    text: `Device shipped for ${process.employee_name}. Please confirm receipt.`,
  });
}

async function notifyDeviceReceived(client, process) {
  const hrChannel = process.slack_channel ?? appConfig.channels.hr;
  if (!hrChannel) return;
  await client.chat.postMessage({
    channel: hrChannel,
    text: `:inbox_tray: *${process.employee_name}* confirmed receipt of their device. Process #${process.id}.`,
  });
}

function buildShippingInfoModal(processId) {
  return {
    type: 'modal',
    callback_id: 'modal_shipping_info_submit',
    private_metadata: String(processId),
    title:  { type: 'plain_text', text: 'Confirm Device Shipment' },
    submit: { type: 'plain_text', text: 'Confirm Shipment' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':truck: Enter the shipment details. If the device is being delivered in Medellín, add the delivery note or tracking number.',
        },
      },
      {
        type: 'input',
        block_id: 'shipping_notes',
        label: { type: 'plain_text', text: 'Tracking / Delivery notes' },
        hint:  { type: 'plain_text', text: 'Tracking number, courier, or delivery note for Medellín drop-off.' },
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'value',
          multiline: true,
          placeholder: { type: 'plain_text', text: 'e.g. Servientrega 1234567890 — estimated delivery 2 business days' },
        },
      },
    ],
  };
}
