import { header, divider, section, context, checklistBlock, progressSummary } from './shared.js';

/**
 * Builds the persistent tracker message blocks for an offboarding process.
 *
 * @param {object} process - Row from ProcessRepository
 * @param {Array}  steps   - Rows from StepRepository.findAllForProcess()
 */
export function buildOffboardingTrackerBlocks(process, steps) {
  const lastDayStr = process.last_day
    ? new Date(process.last_day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD';

  const reasonLabels = {
    resignation: 'Voluntary Resignation',
    contract_end: 'Contract End',
    mutual: 'Mutual Agreement',
    termination: 'Termination',
    retirement: 'Retirement',
  };

  const statusBadge = {
    pending: ':clock1: Pending',
    in_progress: ':hourglass_flowing_sand: In Progress',
    completed: ':white_check_mark: Completed',
    cancelled: ':no_entry: Cancelled',
    failed: ':x: Failed',
  }[process.status] ?? process.status;

  const clientName = process.client_name ?? 'GSD';

  const blocks = [
    header('Employee Offboarding'),
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Client:*\n:office: ${clientName}` },
        { type: 'mrkdwn', text: `*Employee:*\n${process.employee_name}` },
        { type: 'mrkdwn', text: `*Email:*\n${process.employee_email}` },
        { type: 'mrkdwn', text: `*Last Day:*\n${lastDayStr}` },
        { type: 'mrkdwn', text: `*Manager:*\n${process.manager_slack ? `<@${process.manager_slack}>` : '—'}` },
        ...(process.offboard_reason
          ? [{ type: 'mrkdwn', text: `*Reason:*\n${reasonLabels[process.offboard_reason] ?? process.offboard_reason}` }]
          : []),
        ...(process.file_transfer_to
          ? [{ type: 'mrkdwn', text: `*Files Transfer To:*\n<@${process.file_transfer_to}>` }]
          : []),
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Status:*\n${statusBadge}` },
        { type: 'mrkdwn', text: `*Process ID:*\n#${process.id}` },
      ],
    },
    divider(),
    section(progressSummary(steps)),
    checklistBlock(steps),
    divider(),
  ];

  if (!['completed', 'cancelled', 'failed'].includes(process.status)) {
    blocks.push({
      type: 'actions',
      block_id: 'offboarding_actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: ':package: Confirm Hardware Returned', emoji: true },
          style: 'primary',
          action_id: 'offboarding_hardware_confirmed',
          value: String(process.id),
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: ':speech_balloon: Exit Interview Done', emoji: true },
          action_id: 'offboarding_exit_done',
          value: String(process.id),
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: ':no_entry: Revoke All Access Now', emoji: true },
          style: 'danger',
          action_id: 'offboarding_revoke_all',
          value: String(process.id),
          confirm: {
            title: { type: 'plain_text', text: 'Revoke All Access?' },
            text: {
              type: 'mrkdwn',
              text: 'This will immediately revoke GitHub and Google Workspace access. This *cannot* be undone.',
            },
            confirm: { type: 'plain_text', text: 'Yes, Revoke' },
            deny: { type: 'plain_text', text: 'Not Yet' },
          },
        },
      ],
    });
  }

  blocks.push(
    context(
      `Initiated by ${process.initiated_by ? `<@${process.initiated_by}>` : 'unknown'} | Process #${process.id} | ${new Date(process.created_at).toUTCString()}`
    )
  );

  return blocks;
}
