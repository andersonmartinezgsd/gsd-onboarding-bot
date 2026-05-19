/**
 * MySQL connection pool usando mysql2/promise.
 * Se activa cuando DB_TYPE=mysql en .env
 */
import mysql from 'mysql2/promise';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

let _pool = null;

export function getMysqlPool() {
  if (_pool) return _pool;

  const cfg = appConfig.db.mysql;

  _pool = mysql.createPool({
    host:               cfg.host,
    port:               cfg.port,
    user:               cfg.user,
    password:           cfg.password,
    database:           cfg.database,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    enableKeepAlive:    true,
    keepAliveInitialDelay: 0,
    charset:            'utf8mb4',
    timezone:           'Z',
    // Devuelve columnas DATE como string ISO
    dateStrings:        ['DATE'],
  });

  // Test connection on startup
  _pool.getConnection()
    .then(conn => {
      logger.info('MySQL connection pool established', {
        host: cfg.host,
        database: cfg.database,
      });
      conn.release();
    })
    .catch(err => {
      logger.error('MySQL connection failed', { error: err.message });
      process.exit(1);
    });

  return _pool;
}

export async function closeMysql() {
  if (_pool) {
    await _pool.end();
    _pool = null;
    logger.info('MySQL pool closed');
  }
}

/**
 * Helper: ejecuta una query y devuelve [rows, fields]
 */
export async function query(sql, params = []) {
  const pool = getMysqlPool();
  return pool.execute(sql, params);
}

/**
 * Helper: devuelve solo las filas (primer elemento)
 */
export async function queryRows(sql, params = []) {
  const [rows] = await query(sql, params);
  return rows;
}

/**
 * Helper: devuelve solo la primera fila o null
 */
export async function queryOne(sql, params = []) {
  const rows = await queryRows(sql, params);
  return rows[0] ?? null;
}
