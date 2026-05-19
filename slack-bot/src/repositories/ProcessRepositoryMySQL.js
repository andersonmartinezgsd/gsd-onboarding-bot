/**
 * ProcessRepository — implementación MySQL (async)
 * Misma interfaz que ProcessRepository (SQLite) pero con Promises.
 */
import { queryOne, queryRows } from '../db/mysql-connection.js';

export class ProcessRepositoryMySQL {

  async create(data) {
    const toolsJson    = JSON.stringify(data.tools    ?? ['google_workspace']);
    const reposJson    = JSON.stringify(data.repos    ?? []);
    const channelsJson = JSON.stringify(data.channels ?? []);
    const metaJson     = JSON.stringify(data.meta     ?? {});

    const [result] = await queryRows(
      `INSERT INTO processes
        (process_type, client_name, employee_name, employee_email, department,
         role_title, start_date, last_day, manager_slack,
         file_transfer_to, github_username, google_email,
         tools_json, repos_json, channels_json, offboard_reason,
         slack_channel, slack_ts, initiated_by, meta_json)
       VALUES (?,?,?,?,?, ?,?,?,?, ?,?,?, ?,?,?,?, ?,?,?,?)`,
      [
        data.processType,
        data.clientName     ?? 'GSD',
        data.employeeName,
        data.employeeEmail,
        data.department     ?? null,
        data.roleTitle      ?? null,
        data.startDate      ?? null,
        data.lastDay        ?? null,
        data.managerSlack   ?? null,
        data.fileTransferTo ?? null,
        data.githubUsername ?? null,
        data.googleEmail    ?? null,
        toolsJson,
        reposJson,
        channelsJson,
        data.offboardReason ?? null,
        data.slackChannel   ?? null,
        data.slackTs        ?? null,
        data.initiatedBy    ?? null,
        metaJson,
      ]
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const row = await queryOne('SELECT * FROM processes WHERE id = ?', [id]);
    return row ? this._deserialize(row) : null;
  }

  async findByStatus(status, processType = null) {
    let sql = 'SELECT * FROM processes WHERE status = ?';
    const params = [status];
    if (processType) { sql += ' AND process_type = ?'; params.push(processType); }
    sql += ' ORDER BY created_at DESC';
    const rows = await queryRows(sql, params);
    return rows.map(r => this._deserialize(r));
  }

  async update(id, data) {
    const fieldMap = {
      status:         'status',
      slackTs:        'slack_ts',
      slackChannel:   'slack_channel',
      employeeSlack:  'employee_slack',
      googleEmail:    'google_email',
      githubUsername: 'github_username',
    };

    const setClauses = [];
    const values     = [];

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        setClauses.push(`\`${col}\` = ?`);
        values.push(data[key]);
      }
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    await queryRows(
      `UPDATE processes SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  _deserialize(row) {
    const parse = (v, fallback) => {
      if (!v) return fallback;
      if (typeof v === 'object') return v; // MySQL JSON ya lo deserializa
      try { return JSON.parse(v); } catch { return fallback; }
    };
    return {
      ...row,
      tools:    parse(row.tools_json,    ['google_workspace']),
      repos:    parse(row.repos_json,    []),
      channels: parse(row.channels_json, []),
      meta:     parse(row.meta_json,     {}),
    };
  }
}
