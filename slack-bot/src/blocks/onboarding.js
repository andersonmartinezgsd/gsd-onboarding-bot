import { header, divider, section, context, checklistBlock, progressSummary } from './shared.js';

/**
 * Builds the persistent tracker message blocks for an onboarding process.
 */
export function buildOnboardingTrackerBlocks(process, steps) {
  const startDateStr = process.start_date
    ? new Date(process.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD';

  const statusBadge = {
    pending:     ':clock1: Pending',
    in_progress: ':hourglass_flowing_sand: In Progress',
    completed:   ':white_check_mark: Completed',
    cancelled:   ':no_entry: Cancelled',
    failed:      ':x: Failed',
  }[process.status] ?? process.status;

  const clientName  = process.client_name ?? 'GSD';
  const displayName = process.first_name && process.last_name
    ? `${process.first_name} ${process.last_name}`
    : process.employee_name;

  const blocks = [
    header('New Employee Onboarding'),
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Client:*\n:office: ${clientName}` },
        { type: 'mrkdwn', text: `*Employee:*\n${displayName}` },
        { type: 'mrkdwn', text: `*Corporate Email:*\n${process.employee_email}` },
        { type: 'mrkdwn', text: `*Department:*\n${process.department ?? '—'}` },
        { type: 'mrkdwn', text: `*Role:*\n${process.role_title ?? '—'}` },
        { type: 'mrkdwn', text: `*Start Date:*\n${startDateStr}` },
        { type: 'mrkdwn', text: `*Manager:*\n${process.manager_slack ? `<@${process.manager_slack}>` : '—'}` },
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Status:*\n${statusBadge}` },
        { type: 'mrkdwn', text: `*Process ID:*\n#${process.id}` },
        ...(process.equipment_status && process.equipment_status !== 'pending'
          ? [{ type: 'mrkdwn', text: `*Equipment:*\n${equipmentStatusLabel(process.equipment_status)}` }]
          : []),
      ],
    },
    divider(),
    section(progressSummary(steps)),
    checklistBlock(steps),
    divider(),
  ];

  if (!['completed', 'cancelled', 'failed'].includes(process.status)) {
    const actionElements = [];

    const paperworkStep = steps.find((s) => s.step_key === 'gate_hr_paperwork' && s.status === 'pending');
    if (paperworkStep) {
      actionElements.push({
        type: 'button',
        text: { type: 'plain_text', text: ':page_facing_up: Contracts Signed', emoji: true },
        style: 'primary',
        action_id: 'gate_hr_paperwork_done',
        value: String(process.id),
      });
    }

    const managerStep = steps.find((s) => s.step_key === 'gate_manager_confirm' && s.status === 'pending');
    if (managerStep) {
      actionElements.push({
        type: 'button',
        text: { type: 'plain_text', text: ':handshake: Employee Briefed', emoji: true },
        style: 'primary',
        action_id: 'gate_manager_confirm_done',
        value: String(process.id),
      });
    }

    const shippedStep = steps.find((s) => s.step_key === 'gate_device_shipped' && s.status === 'pending');
    if (shippedStep) {
      actionElements.push({
        type: 'button',
        text: { type: 'plain_text', text: ':truck: Confirm Shipment', emoji: true },
        action_id: 'gate_device_shipped_confirm',
        value: String(process.id),
      });
    }

    actionElements.push({
      type: 'button',
      text: { type: 'plain_text', text: ':x: Cancel Process', emoji: true },
      style: 'danger',
      action_id: 'onboarding_cancel',
      value: String(process.id),
      confirm: {
        title: { type: 'plain_text', text: 'Cancel Onboarding?' },
        text: {
          type: 'mrkdwn',
          text: 'This will stop all remaining steps. Completed actions will *not* be reversed.',
        },
        confirm: { type: 'plain_text', text: 'Yes, Cancel' },
        deny:    { type: 'plain_text', text: 'Keep Going' },
      },
    });

    if (actionElements.length > 0) {
      blocks.push({ type: 'actions', block_id: 'onboarding_actions', elements: actionElements });
    }
  }

  blocks.push(
    context(
      `Started by ${process.initiated_by ? `<@${process.initiated_by}>` : 'unknown'} | Process #${process.id} | ${new Date(process.created_at).toUTCString()}`
    )
  );

  return blocks;
}

function equipmentStatusLabel(status) {
  return {
    available:        ':white_check_mark: Available',
    vendor_requested: ':package: Vendor quote requested',
    shipped:          ':truck: Shipped',
    received:         ':inbox_tray: Received',
    not_required:     ':heavy_minus_sign: Not required',
    pending:          ':clock1: Pending',
  }[status] ?? status;
}
