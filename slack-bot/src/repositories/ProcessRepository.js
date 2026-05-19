import { getDb } from '../db/connection.js';
import { appConfig } from '../config/index.js';

export class ProcessRepository {
  get db() {
    return getDb();
  }

  create(data) {
    const defaultName = appConfig.companyName || 'GSD';
    const stmt = this.db.prepare(`
      INSERT INTO processes (
        process_type, client_name,
        first_name, last_name, employee_name, employee_email,
        department, role_title, start_date, last_day,
        manager_slack, file_transfer_to,
        github_username, google_email,
        tools_json, repos_json, channels_json,
        offboard_reason, slack_channel, slack_ts,
        initiated_by, meta_json
      ) VALUES (
        @process_type, @client_name,
        @first_name, @last_name, @employee_name, @employee_email,
        @department, @role_title, @start_date, @last_day,
        @manager_slack, @file_transfer_to,
        @github_username, @google_email,
        @tools_json, @repos_json, @channels_json,
        @offboard_reason, @slack_channel, @slack_ts,
        @initiated_by, @meta_json
      )
    `);

    const result = stmt.run({
      process_type:    data.processType,
      client_name:     data.clientName ?? defaultName,
      first_name:      data.firstName  ?? null,
      last_name:       data.lastName   ?? null,
      employee_name:   data.employeeName,
      employee_email:  data.employeeEmail,
      department:      data.department   ?? null,
      role_title:      data.roleTitle    ?? null,
      start_date:      data.startDate    ?? null,
      last_day:        data.lastDay      ?? null,
      manager_slack:   data.managerSlack ?? null,
      file_transfer_to: data.fileTransferTo ?? null,
      github_username: data.githubUsername ?? null,
      google_email:    data.googleEmail   ?? null,
      tools_json:      JSON.stringify(data.tools    ?? ['google_workspace']),
      repos_json:      JSON.stringify(data.repos    ?? []),
      channels_json:   JSON.stringify(data.channels ?? []),
      offboard_reason: data.offboardReason ?? null,
      slack_channel:   data.slackChannel  ?? null,
      slack_ts:        data.slackTs       ?? null,
      initiated_by:    data.initiatedBy   ?? null,
      meta_json:       JSON.stringify(data.meta ?? {}),
    });

    return this.findById(result.lastInsertRowid);
  }

  findById(id) {
    const row = this.db.prepare('SELECT * FROM processes WHERE id = ?').get(id);
    return row ? this._deserialize(row) : null;
  }

  findByStatus(status, processType = null) {
    let sql = 'SELECT * FROM processes WHERE status = ?';
    const params = [status];

    if (processType) {
      sql += ' AND process_type = ?';
      params.push(processType);
    }

    sql += ' ORDER BY created_at DESC';
    return this.db.prepare(sql).all(...params).map((r) => this._deserialize(r));
  }

  update(id, data) {
    const fields = [];
    const values = {};

    const fieldMap = {
      status:          'status',
      slackTs:         'slack_ts',
      slackChannel:    'slack_channel',
      employeeSlack:   'employee_slack',
      googleEmail:     'google_email',
      githubUsername:  'github_username',
      equipmentStatus: 'equipment_status',
      equipmentShippedAt:  'equipment_shipped_at',
      equipmentReceivedAt: 'equipment_received_at',
      equipmentNotes:  'equipment_notes',
      vendorQuoteUrl:  'vendor_quote_url',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = @${key}`);
        values[key] = data[key];
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.id = id;
    this.db.prepare(`UPDATE processes SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.findById(id);
  }

  updateEquipmentStatus(id, status, extra = {}) {
    return this.update(id, {
      equipmentStatus:      status,
      equipmentShippedAt:   extra.shipped_at  ?? undefined,
      equipmentReceivedAt:  extra.received_at ?? undefined,
      equipmentNotes:       extra.notes       ?? undefined,
    });
  }

  _deserialize(row) {
    return {
      ...row,
      tools:    JSON.parse(row.tools_json    ?? '["google_workspace"]'),
      repos:    JSON.parse(row.repos_json    ?? '[]'),
      channels: JSON.parse(row.channels_json ?? '[]'),
      meta:     JSON.parse(row.meta_json     ?? '{}'),
    };
  }
}
