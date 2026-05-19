#!/usr/bin/env node
/**
 * migrate-to-mysql.js
 * Migra datos existentes de SQLite → MySQL.
 *
 * Uso:
 *   node scripts/migrate-to-mysql.js
 *
 * Requiere en .env:
 *   DB_TYPE=mysql
 *   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *   DB_PATH (ruta al SQLite origen)
 */
import 'dotenv/config';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import { resolve } from 'path';

const SQLITE_PATH = process.env.DB_PATH ?? './storage/db/onboarding.sqlite';

const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     ?? '127.0.0.1',
  port:     parseInt(process.env.MYSQL_PORT ?? '3306'),
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset:  'utf8mb4',
});

async function main() {
  console.log('🔄 Iniciando migración SQLite → MySQL\n');

  // Conectar a SQLite
  let sqlite;
  try {
    sqlite = new Database(resolve(process.cwd(), SQLITE_PATH), { readonly: true });
    console.log(`✅ SQLite conectado: ${SQLITE_PATH}`);
  } catch (e) {
    console.log(`⚠️  SQLite no encontrado en ${SQLITE_PATH} — nada que migrar`);
    await pool.end();
    return;
  }

  const conn = await pool.getConnection();
  console.log(`✅ MySQL conectado: ${process.env.MYSQL_DATABASE}\n`);

  try {
    await conn.beginTransaction();

    // ── Migrar processes ─────────────────────────────────────────────────────
    const processes = sqlite.prepare('SELECT * FROM processes').all();
    console.log(`📦 Migrando ${processes.length} processes...`);

    for (const p of processes) {
      await conn.execute(
        `INSERT IGNORE INTO processes
          (id, process_type, status, client_name,
           employee_name, employee_email, employee_slack, department, role_title,
           start_date, last_day, manager_slack, file_transfer_to,
           github_username, google_email,
           tools_json, repos_json, channels_json, offboard_reason,
           slack_channel, slack_ts, initiated_by, meta_json,
           created_at, updated_at)
         VALUES (?,?,?,?, ?,?,?,?,?, ?,?,?,?, ?,?, ?,?,?,?, ?,?,?,?, ?,?)`,
        [
          p.id, p.process_type, p.status, p.client_name ?? 'GSD',
          p.employee_name, p.employee_email, p.employee_slack ?? null,
          p.department ?? null, p.role_title ?? null,
          p.start_date ?? null, p.last_day ?? null,
          p.manager_slack ?? null, p.file_transfer_to ?? null,
          p.github_username ?? null, p.google_email ?? null,
          p.tools_json ?? '["google_workspace"]',
          p.repos_json ?? '[]',
          p.channels_json ?? '[]',
          p.offboard_reason ?? null,
          p.slack_channel ?? null, p.slack_ts ?? null,
          p.initiated_by ?? null, p.meta_json ?? '{}',
          p.created_at, p.updated_at,
        ]
      );
    }
    console.log(`  ✅ ${processes.length} processes migrados`);

    // ── Migrar steps ─────────────────────────────────────────────────────────
    const steps = sqlite.prepare('SELECT * FROM steps').all();
    console.log(`\n📦 Migrando ${steps.length} steps...`);

    for (const s of steps) {
      await conn.execute(
        `INSERT IGNORE INTO steps
          (id, process_id, step_key, step_label, status,
           assigned_to, result_json, error_message,
           started_at, completed_at, created_at)
         VALUES (?,?,?,?,?, ?,?,?, ?,?,?)`,
        [
          s.id, s.process_id, s.step_key, s.step_label, s.status,
          s.assigned_to ?? null,
          s.result_json ?? null,
          s.error_message ?? null,
          s.started_at ?? null,
          s.completed_at ?? null,
          s.created_at,
        ]
      );
    }
    console.log(`  ✅ ${steps.length} steps migrados`);

    await conn.commit();
    console.log('\n🎉 Migración completada exitosamente');

    // Reset AUTO_INCREMENT
    if (processes.length > 0) {
      const maxId = Math.max(...processes.map(p => p.id));
      await conn.execute(`ALTER TABLE processes AUTO_INCREMENT = ${maxId + 1}`);
    }
    if (steps.length > 0) {
      const maxId = Math.max(...steps.map(s => s.id));
      await conn.execute(`ALTER TABLE steps AUTO_INCREMENT = ${maxId + 1}`);
    }

  } catch (err) {
    await conn.rollback();
    console.error('\n❌ Error durante la migración:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    sqlite.close();
    await pool.end();
  }
}

main();
