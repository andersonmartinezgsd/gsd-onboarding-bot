import { ProcessRepository } from '../repositories/ProcessRepository.js';
import { StepRepository } from '../repositories/StepRepository.js';
import { buildOnboardingTrackerBlocks } from '../blocks/onboarding.js';
import { ALL_ONBOARDING_STEPS, getStepsForProcess, stepExecutors, isManualStep } from './steps.js';
import { notifyWebhook } from '../integrations/webhook.js';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { WorkflowError } from '../utils/errors.js';

const processRepo = new ProcessRepository();
const stepRepo = new StepRepository();

/**
 * Starts an onboarding process from modal form data.
 * Posts the initial tracker message, then runs automated steps.
 */
export async function startOnboarding(formData, ctx) {
  const { client, body } = ctx;
  const initiatedBy = body.user.id;
  const channel = appConfig.channels.hr ?? body.user.id;

  // 1. Create process record
  const process = processRepo.create({
    processType:   'onboarding',
    clientName:    formData.clientName ?? appConfig.companyName ?? 'GSD',
    firstName:     formData.firstName,
    lastName:      formData.lastName,
    employeeName:  formData.employeeName,
    employeeEmail: formData.employeeEmail,
    department:    formData.department,
    roleTitle:     formData.roleTitle,
    startDate:     formData.startDate,
    managerSlack:  formData.manager,
    githubUsername: formData.githubUsername,
    tools:         formData.tools,
    channels:      formData.slackChannels ?? [],
    slackChannel:  channel,
    initiatedBy,
  });

  // 2. Initialise steps relevant to this employee's tool set
  const applicableSteps = getStepsForProcess(process, ALL_ONBOARDING_STEPS);
  for (const step of applicableSteps) {
    stepRepo.addStep(process.id, step.key, step.label, step.manual ? formData.manager : null);
  }

  // 3. Post initial tracker message
  const steps = stepRepo.findAllForProcess(process.id);
  const blocks = buildOnboardingTrackerBlocks(process, steps);

  const posted = await client.chat.postMessage({
    channel,
    blocks,
    text: `Onboarding started for ${process.employee_name}`,
  });

  // 4. Save message reference
  processRepo.update(process.id, { slackTs: posted.ts, slackChannel: channel, status: 'in_progress' });
  const updatedProcess = processRepo.findById(process.id);

  logger.info('Onboarding process started', { processId: process.id, employee: process.employee_name });
  await notifyWebhook('onboarding.started', updatedProcess);

  // 5. Run automated steps asynchronously
  setImmediate(() => runOnboardingSteps(updatedProcess, client));
}

async function runOnboardingSteps(process, client) {
  const applicableSteps = getStepsForProcess(process, ALL_ONBOARDING_STEPS);

  for (const stepDef of applicableSteps) {
    if (isManualStep(stepDef.key)) continue;

    const executor = stepExecutors[stepDef.key];
    if (!executor) continue;

    stepRepo.updateStep(process.id, stepDef.key, { status: 'in_progress' });
    await refreshTrackerMessage(process.id, client);

    try {
      const result = await executor(process, client);
      const status = result?.skipped ? 'skipped' : 'completed';
      stepRepo.updateStep(process.id, stepDef.key, { status, resultJson: result });
      logger.info(`Step ${stepDef.key} ${status}`, { processId: process.id });
    } catch (err) {
      logger.error(`Step ${stepDef.key} failed`, { processId: process.id, error: err.message });
      stepRepo.updateStep(process.id, stepDef.key, {
        status: 'failed',
        errorMessage: err.message,
      });
    }

    // Reload process in case integrations updated it (e.g. google_email stored)
    process = processRepo.findById(process.id);
    await refreshTrackerMessage(process.id, client);
  }

  // After all automated steps, check overall state
  const allSteps = stepRepo.findAllForProcess(process.id);
  const autoSteps = allSteps.filter((s) => !isManualStep(s.step_key));
  const allDoneOrSkipped = autoSteps.every((s) => ['completed', 'skipped', 'failed'].includes(s.status));

  if (allDoneOrSkipped) {
    // Process stays in_progress until manual gates are cleared
    processRepo.update(process.id, { status: 'in_progress' });
    await refreshTrackerMessage(process.id, client);
    logger.info('Onboarding automated steps finished', { processId: process.id });
    await notifyWebhook('onboarding.automated_complete', processRepo.findById(process.id));

    // Schedule stall reminder: warn if manual gates have no progress after 24h
    scheduleStallReminder(process.id, client);
  }
}

/**
 * Marks a manual gate step as completed and refreshes the tracker.
 * Also checks if all steps are now done to mark the process complete.
 */
export async function completeManualStep(processId, stepKey, client, meta = {}) {
  const process = processRepo.findById(processId);
  if (!process) throw new WorkflowError('Process not found', processId);

  stepRepo.updateStep(processId, stepKey, { status: 'completed', resultJson: { manual: true, ...meta } });

  const allSteps = stepRepo.findAllForProcess(processId);
  const allComplete = allSteps.every((s) => ['completed', 'skipped'].includes(s.status));

  if (allComplete) {
    processRepo.update(processId, { status: 'completed' });
    await notifyWebhook('onboarding.completed', processRepo.findById(processId));

    // Post completion report to the HR channel
    await postCompletionReport(processId, client);
  }

  await refreshTrackerMessage(processId, client);
}

export async function cancelProcess(processId, client) {
  processRepo.update(processId, { status: 'cancelled' });
  await refreshTrackerMessage(processId, client);
  await notifyWebhook('onboarding.cancelled', processRepo.findById(processId));
}

// ─── Completion Report ────────────────────────────────────────────────────────

async function postCompletionReport(processId, client) {
  const process = processRepo.findById(processId);
  const steps   = stepRepo.findAllForProcess(processId);
  const channel = process.slack_channel ?? appConfig.channels.hr;
  if (!channel) return;

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const skippedSteps   = steps.filter((s) => s.status === 'skipped').length;
  const failedSteps    = steps.filter((s) => s.status === 'failed').length;

  try {
    await client.chat.postMessage({
      channel,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: ':tada: Onboarding Completed', emoji: true },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Employee:*\n${process.employee_name}` },
            { type: 'mrkdwn', text: `*Email:*\n${process.employee_email}` },
            { type: 'mrkdwn', text: `*Role:*\n${process.role_title ?? '—'}` },
            { type: 'mrkdwn', text: `*Department:*\n${process.department ?? '—'}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Summary:* ${completedSteps} steps completed · ${skippedSteps} skipped · ${failedSteps} failed\n` +
              `Process #${process.id} finished on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}.`,
          },
        },
      ],
      text: `Onboarding completed for ${process.employee_name}. Process #${process.id}.`,
    });
  } catch (err) {
    logger.warn('Failed to post completion report', { processId, error: err.message });
  }
}

// ─── Stall Detection ──────────────────────────────────────────────────────────

const stallTimers = new Map(); // processId → timeout

function scheduleStallReminder(processId, client, delayMs = 24 * 60 * 60 * 1000) {
  if (stallTimers.has(processId)) return;

  const timer = setTimeout(async () => {
    stallTimers.delete(processId);
    await sendStallReminder(processId, client);
  }, delayMs);

  // Avoid blocking Node.js exit
  if (timer.unref) timer.unref();
  stallTimers.set(processId, timer);
}

async function sendStallReminder(processId, client) {
  const process = processRepo.findById(processId);
  if (!process || ['completed', 'cancelled'].includes(process.status)) return;

  const steps = stepRepo.findAllForProcess(processId);
  const pending = steps.filter((s) => s.status === 'pending' && isManualStep(s.step_key));
  if (pending.length === 0) return;

  const channel = process.slack_channel ?? appConfig.channels.hr;
  if (!channel) return;

  try {
    await client.chat.postMessage({
      channel,
      text: `:warning: *Recordatorio:* El onboarding de *${process.employee_name}* (Proceso #${processId}) lleva más de 24 horas sin avance.\n\n` +
        `Pasos pendientes de confirmación:\n${pending.map((s) => `• ${s.step_label}`).join('\n')}`,
    });
    logger.info('Stall reminder sent', { processId, pendingCount: pending.length });

    // Schedule next reminder in 24h
    scheduleStallReminder(processId, client, 24 * 60 * 60 * 1000);
  } catch (err) {
    logger.warn('Failed to send stall reminder', { processId, error: err.message });
  }
}

// ─── Tracker refresh ──────────────────────────────────────────────────────────

async function refreshTrackerMessage(processId, client) {
  const process = processRepo.findById(processId);
  if (!process?.slack_ts || !process?.slack_channel) return;

  const steps  = stepRepo.findAllForProcess(processId);
  const blocks = buildOnboardingTrackerBlocks(process, steps);

  try {
    await client.chat.update({
      channel: process.slack_channel,
      ts:      process.slack_ts,
      blocks,
      text: `Onboarding: ${process.employee_name} — ${process.status}`,
    });
  } catch (err) {
    logger.warn('Failed to update tracker message', { processId, error: err.message });
  }
}
