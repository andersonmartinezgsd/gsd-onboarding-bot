/**
 * StepRepository — implementación MySQL (async)
 */
import { queryOne, queryRows } from '../db/mysql-connection.js';

export class StepRepositoryMySQL {

  async createMany(processId, steps) {
    if (!steps.length) return [];
    const placeholders = steps.map(() => '(?,?,?,?,?)').join(',');
    const values = steps.flatMap(s => [
      processId,
      s.key,
      s.label,
      s.actor ?? null,
      s.status ?? 'pending',
    ]);

    await queryRows(
      `INSERT IGNORE INTO steps (process_id, step_key, step_label, actor, status)
       VALUES ${placeholders}`,
      values
    );

    return this.findByProcessId(processId);
  }

  async findByProcessId(processId) {
    return queryRows(
      'SELECT * FROM steps WHERE process_id = ? ORDER BY id ASC',
      [processId]
    );
  }

  async updateStatus(processId, stepKey, status, extra = {}) {
    const setClauses = ['`status` = ?'];
    const values     = [status];

    if (status === 'in_progress' && !extra.started_at) {
      setClauses.push('`started_at` = NOW()');
    }
    if (['completed','failed','skipped'].includes(status) && !extra.completed_at) {
      setClauses.push('`completed_at` = NOW()');
    }
    if (extra.errorMessage !== undefined) {
      setClauses.push('`error_message` = ?');
      values.push(extra.errorMessage ?? null);
    }
    if (extra.result !== undefined) {
      setClauses.push('`result_json` = ?');
      values.push(JSON.stringify(extra.result));
    }

    values.push(processId, stepKey);

    await queryRows(
      `UPDATE steps SET ${setClauses.join(', ')}
       WHERE process_id = ? AND step_key = ?`,
      values
    );

    return queryOne(
      'SELECT * FROM steps WHERE process_id = ? AND step_key = ?',
      [processId, stepKey]
    );
  }

  async findPendingStep(processId) {
    return queryOne(
      "SELECT * FROM steps WHERE process_id = ? AND status = 'pending' ORDER BY id ASC LIMIT 1",
      [processId]
    );
  }
}
