import { getDb } from '../db/connection.js';

export class StepRepository {
  get db() {
    return getDb();
  }

  addStep(processId, stepKey, stepLabel, assignedTo = null) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO steps (process_id, step_key, step_label, assigned_to)
      VALUES (@process_id, @step_key, @step_label, @assigned_to)
    `);
    const result = stmt.run({ process_id: processId, step_key: stepKey, step_label: stepLabel, assigned_to: assignedTo });
    return this.findByKey(processId, stepKey);
  }

  findByKey(processId, stepKey) {
    return this.db.prepare('SELECT * FROM steps WHERE process_id = ? AND step_key = ?').get(processId, stepKey);
  }

  findAllForProcess(processId) {
    return this.db.prepare('SELECT * FROM steps WHERE process_id = ? ORDER BY id ASC').all(processId);
  }

  updateStep(processId, stepKey, data) {
    const fields = [];
    const values = { process_id: processId, step_key: stepKey };

    if (data.status !== undefined) {
      fields.push('status = @status');
      values.status = data.status;
    }
    if (data.resultJson !== undefined) {
      fields.push('result_json = @result_json');
      values.result_json = typeof data.resultJson === 'string' ? data.resultJson : JSON.stringify(data.resultJson);
    }
    if (data.errorMessage !== undefined) {
      fields.push('error_message = @error_message');
      values.error_message = data.errorMessage;
    }
    if (data.status === 'in_progress') {
      fields.push("started_at = datetime('now')");
    }
    if (data.status === 'completed' || data.status === 'failed') {
      fields.push("completed_at = datetime('now')");
    }

    if (fields.length === 0) return;

    this.db
      .prepare(`UPDATE steps SET ${fields.join(', ')} WHERE process_id = @process_id AND step_key = @step_key`)
      .run(values);
  }
}
