import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function runMigrations() {
  const schemaPath = resolve(__dirname, '../../database/schema.sql');
  const sql = readFileSync(schemaPath, 'utf-8');

  const db = getDb();
  const statements = splitStatements(sql);

  // Separate DDL (ALTER TABLE) from the rest — DDL must run outside a transaction
  // because SQLite cannot reliably roll back schema changes, and better-sqlite3
  // wraps the transaction callback before exec() is called.
  const ddlStatements = [];
  const dmlStatements = [];

  for (const stmt of statements) {
    if (stmt.toUpperCase().trimStart().startsWith('ALTER TABLE')) {
      ddlStatements.push(stmt);
    } else {
      dmlStatements.push(stmt);
    }
  }

  // Run CREATE TABLE / INSERT seed data inside a transaction
  db.transaction(() => {
    for (const stmt of dmlStatements) {
      const upper = stmt.toUpperCase().trimStart();
      try {
        db.exec(stmt);
      } catch (err) {
        if (upper.startsWith('PRAGMA')) continue;
        throw err;
      }
    }
  })();

  // Run ALTER TABLE statements individually outside the transaction (idempotent)
  for (const stmt of ddlStatements) {
    try {
      db.exec(stmt);
    } catch (err) {
      if (err.message?.includes('duplicate column name')) continue; // column already exists
      logger.warn('Migration DDL warning', { stmt: stmt.slice(0, 80), error: err.message });
    }
  }

  logger.info('Database migrations completed');
}

/**
 * Splits a SQL script into individual statements, respecting BEGIN...END blocks
 * (needed for CREATE TRIGGER which contains semicolons inside the body).
 */
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let depth = 0; // tracks BEGIN...END nesting

  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    // Skip pure comment lines
    if (trimmed.startsWith('--')) continue;

    const upper = trimmed.toUpperCase();
    if (upper === 'BEGIN' || upper.endsWith(' BEGIN')) depth++;
    if (upper === 'END' || upper === 'END;') depth--;

    current += line + '\n';

    if (depth === 0 && trimmed.endsWith(';')) {
      const stmt = current.trim().replace(/;$/, '');
      if (stmt.length > 0) statements.push(stmt);
      current = '';
    }
  }

  const remaining = current.trim().replace(/;$/, '');
  if (remaining.length > 0) statements.push(remaining);

  return statements;
}
