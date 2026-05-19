import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ProcessRepository } from '../src/repositories/ProcessRepository.js';
import { StepRepository } from '../src/repositories/StepRepository.js';
import { closeDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations.js';

beforeAll(() => {
  runMigrations();
});

afterAll(() => {
  closeDb();
});

describe('ProcessRepository', () => {
  const repo = new ProcessRepository();

  it('creates and retrieves an onboarding process', () => {
    const p = repo.create({
      processType: 'onboarding',
      employeeName: 'Test User',
      employeeEmail: 'test@company.com',
      department: 'Engineering',
      startDate: '2026-04-14',
    });

    expect(p.id).toBeTypeOf('number');
    expect(p.employee_name).toBe('Test User');
    expect(p.process_type).toBe('onboarding');
    expect(p.status).toBe('pending');
  });

  it('updates process status', () => {
    const p = repo.create({
      processType: 'onboarding',
      employeeName: 'Update Test',
      employeeEmail: 'update@company.com',
    });

    const updated = repo.update(p.id, { status: 'in_progress' });
    expect(updated.status).toBe('in_progress');
  });

  it('finds by status', () => {
    repo.create({ processType: 'onboarding', employeeName: 'A', employeeEmail: 'a@c.com' });
    repo.create({ processType: 'offboarding', employeeName: 'B', employeeEmail: 'b@c.com' });

    const onboardings = repo.findByStatus('pending', 'onboarding');
    expect(onboardings.length).toBeGreaterThanOrEqual(1);
    expect(onboardings.every((p) => p.process_type === 'onboarding')).toBe(true);
  });
});

describe('StepRepository', () => {
  const processRepo = new ProcessRepository();
  const stepRepo = new StepRepository();

  it('adds and retrieves steps', () => {
    const p = processRepo.create({
      processType: 'onboarding',
      employeeName: 'Step Test',
      employeeEmail: 'step@company.com',
    });

    stepRepo.addStep(p.id, 'create_google_account', 'Create Google account');
    stepRepo.addStep(p.id, 'invite_github_org', 'GitHub invite');

    const steps = stepRepo.findAllForProcess(p.id);
    expect(steps).toHaveLength(2);
    expect(steps[0].status).toBe('pending');
  });

  it('updates step status', () => {
    const p = processRepo.create({
      processType: 'onboarding',
      employeeName: 'Step Update Test',
      employeeEmail: 'su@company.com',
    });

    stepRepo.addStep(p.id, 'create_google_account', 'Create Google account');
    stepRepo.updateStep(p.id, 'create_google_account', {
      status: 'completed',
      resultJson: { email: 'su@company.com' },
    });

    const step = stepRepo.findByKey(p.id, 'create_google_account');
    expect(step.status).toBe('completed');
    expect(step.result_json).toContain('su@company.com');
  });

  it('prevents duplicate step keys', () => {
    const p = processRepo.create({
      processType: 'onboarding',
      employeeName: 'Dedup Test',
      employeeEmail: 'dedup@company.com',
    });

    stepRepo.addStep(p.id, 'same_key', 'First');
    stepRepo.addStep(p.id, 'same_key', 'Second'); // Should not throw (INSERT OR IGNORE)

    const steps = stepRepo.findAllForProcess(p.id);
    expect(steps).toHaveLength(1);
    expect(steps[0].step_label).toBe('First');
  });
});
