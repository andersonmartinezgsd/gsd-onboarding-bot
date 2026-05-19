import { ProcessRepository } from '../repositories/ProcessRepository.js';
import { StepRepository } from '../repositories/StepRepository.js';
import { buildOffboardingTrackerBlocks } from '../blocks/offboarding.js';
import { ALL_OFFBOARDING_STEPS, getStepsForProcess, stepExecutors, isManualStep } from './steps.js';
import { notifyWebhook } from '../integrations/webhook.js';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { WorkflowError } from '../utils/errors.js';

const processRepo = new ProcessRepository();
const stepRepo = new StepRepository();

/**
 * Starts an offboarding process from modal form data.
 */
export async function startOffboarding(formData, ctx) {
  const { client, body } = ctx;
  const initiatedBy = body.user.id;
  const channel = appConfig.channels.hr ?? body.user.id;

  const process = processRepo.create({
    processType:   'offboarding',
    clientName:    formData.clientName ?? appConfig.companyName ?? 'GSD',
    firstName:     formData.firstName,
    lastName:      formData.lastName,
    employeeName:  formData.employeeName,
    employeeEmail: formData.employeeEmail,
    lastDay:       formData.lastDay,
    managerSlack:  formData.manager,
    fileTransferTo: formData.fileTransferTarget,
    offboardReason: formData.offboardReason,
    tools:         formData.tools,
    slackChannel:  channel,
    initiatedBy,
  });

  const applicableSteps = getStepsForProcess(process, ALL_OFFBOARDING_STEPS);
  for (const step of applicableSteps) {
    stepRepo.addStep(process.id, step.key, step.label, step.manual ? formData.manager : null);
  }

  const steps = stepRepo.findAllForProcess(process.id);
  const blocks = buildOffboardingTrackerBlocks(process, steps);

  const posted = await client.chat.postMessage({
    channel,
    blocks,
    text: `Offboarding started for ${process.employee_name}`,
  });

  processRepo.update(process.id, { slackTs: posted.ts, slackChannel: channel, status: 'in_progress' });
  const updatedProcess = processRepo.findById(process.id);

  logger.info('Offboarding process started', { processId: process.id, employee: process.employee_name });
  await notifyWebhook('offboarding.started', updatedProcess);

  // Notify manager immediately (first automated step)
  setImmediate(() => runOffboardingSteps(updatedProcess, client));
}

async function runOffboardingSteps(process, client) {
  // Run non-revocation automated steps first (notify, transfer files)
  // These run immediately; revocation waits for manual trigger or last-day date
  const applicableSteps = getStepsForProcess(process, ALL_OFFBOARDING_STEPS);
  const earlyStepKeys = new Set(['notify_manager_offboard', 'transfer_drive_files']);
  const earlySteps = applicableSteps.filter((s) => earlyStepKeys.has(s.key));

  for (const { key: stepKey } of earlySteps) {
    const executor = stepExecutors[stepKey];
    if (!executor) continue;

    stepRepo.updateStep(process.id, stepKey, { status: 'in_progress' });
    await refreshTrackerMessage(process.id, client);

    try {
      const result = await executor(process, client);
      stepRepo.updateStep(process.id, stepKey, {
        status: result?.skipped ? 'skipped' : 'completed',
        resultJson: result,
      });
    } catch (err) {
      logger.error(`Offboarding step ${stepKey} failed`, { processId: process.id, error: err.message });
      stepRepo.updateStep(process.id, stepKey, { status: 'failed', errorMessage: err.message });
    }

    await refreshTrackerMessage(process.id, client);
  }

  logger.info('Offboarding initial steps done — waiting for manual confirmations', { processId: process.id });
  await notifyWebhook('offboarding.pending_manual', processRepo.findById(process.id));
}

/**
 * Called when IT/HR clicks "Revoke All Access Now" button.
 */
export async function revokeAllAccess(processId, client) {
  const process = processRepo.findById(processId);
  if (!process) throw new WorkflowError('Process not found', processId);

  // Revocation steps are those that aren't manual and haven't run yet
  const REVOKE_STEP_KEYS = new Set([
    'revoke_github_access', 'suspend_google_account',
    'revoke_google_voice', 'deactivate_timedoctor', 'revoke_hubspot',
  ]);
  const applicableSteps = getStepsForProcess(process, ALL_OFFBOARDING_STEPS);
  const revokeSteps = applicableSteps
    .filter((s) => REVOKE_STEP_KEYS.has(s.key) && !s.manual)
    .map((s) => s.key);

  for (const stepKey of revokeSteps) {
    const executor = stepExecutors[stepKey];
    if (!executor) continue;

    stepRepo.updateStep(processId, stepKey, { status: 'in_progress' });

    try {
      const result = await executor(process, client);
      stepRepo.updateStep(processId, stepKey, {
        status: result?.skipped ? 'skipped' : 'completed',
        resultJson: result,
      });
      logger.info(`Access revocation step completed: ${stepKey}`, { processId });
    } catch (err) {
      logger.error(`Access revocation step failed: ${stepKey}`, { processId, error: err.message });
      stepRepo.updateStep(processId, stepKey, { status: 'failed', errorMessage: err.message });
    }
  }

  await refreshTrackerMessage(processId, client);
  await notifyWebhook('offboarding.access_revoked', processRepo.findById(processId));
}

export async function completeManualStep(processId, stepKey, client) {
  const process = processRepo.findById(processId);
  if (!process) throw new WorkflowError('Process not found', processId);

  stepRepo.updateStep(processId, stepKey, { status: 'completed', resultJson: { manual: true } });

  const allSteps = stepRepo.findAllForProcess(processId);
  const allComplete = allSteps.every((s) => ['completed', 'skipped'].includes(s.status));

  if (allComplete) {
    processRepo.update(processId, { status: 'completed' });
    await notifyWebhook('offboarding.completed', processRepo.findById(processId));
  }

  await refreshTrackerMessage(processId, client);
}

async function refreshTrackerMessage(processId, client) {
  const process = processRepo.findById(processId);
  if (!process?.slack_ts || !process?.slack_channel) return;

  const steps = stepRepo.findAllForProcess(processId);
  const blocks = buildOffboardingTrackerBlocks(process, steps);

  try {
    await client.chat.update({
      channel: process.slack_channel,
      ts: process.slack_ts,
      blocks,
      text: `Offboarding: ${process.employee_name} — ${process.status}`,
    });
  } catch (err) {
    logger.warn('Failed to update tracker message', { processId, error: err.message });
  }
}
