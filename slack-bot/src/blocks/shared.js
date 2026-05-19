// Reusable Block Kit components

export function divider() {
  return { type: 'divider' };
}

export function header(text) {
  return {
    type: 'header',
    text: { type: 'plain_text', text, emoji: true },
  };
}

export function section(text) {
  return {
    type: 'section',
    text: { type: 'mrkdwn', text },
  };
}

export function context(text) {
  return {
    type: 'context',
    elements: [{ type: 'mrkdwn', text }],
  };
}

// Maps step status to a Slack emoji name
export function statusEmoji(status) {
  return {
    completed: 'white_check_mark',
    in_progress: 'hourglass_flowing_sand',
    failed: 'x',
    skipped: 'next_track_button',
    pending: 'white_circle',
  }[status] ?? 'white_circle';
}

// Renders an array of step rows as a rich_text bulleted list
export function checklistBlock(steps) {
  return {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_list',
        style: 'bullet',
        elements: steps.map((step) => ({
          type: 'rich_text_section',
          elements: [
            { type: 'emoji', name: statusEmoji(step.status) },
            { type: 'text', text: `  ${step.step_label}` },
            ...(step.status === 'failed' && step.error_message
              ? [{ type: 'text', text: ` — ${step.error_message}`, style: { italic: true } }]
              : []),
          ],
        })),
      },
    ],
  };
}

export function progressSummary(steps) {
  const total = steps.length;
  const done = steps.filter((s) => s.status === 'completed').length;
  const failed = steps.filter((s) => s.status === 'failed').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return `*Progress:* ${done}/${total} steps completed (${pct}%)${failed > 0 ? ` — :x: ${failed} failed` : ''}`;
}
