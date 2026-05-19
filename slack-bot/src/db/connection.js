import Database from 'better-sqlite3';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

let _db = null;

export function getDb() {
  if (_db) return _db;

  const dbPath = resolve(process.cwd(), appConfig.db.path);

  // Ensure parent directory exists
  mkdirSync(dirname(dbPath), { recursive: true });

  _db = new Database(dbPath, { verbose: appConfig.isDev ? null : null });
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  logger.info('Database connection established', { path: dbPath });
  return _db;
}

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
    logger.info('Database connection closed');
  }
}
