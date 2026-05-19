import { appConfig } from '../config/index.js';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[appConfig.logLevel] ?? LEVELS.info;

function log(level, message, meta = {}) {
  if (LEVELS[level] < currentLevel) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };

  if (appConfig.isDev) {
    const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level];
    const reset = '\x1b[0m';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${color}[${level.toUpperCase()}]${reset} ${entry.ts} — ${message}${metaStr}`);
  } else {
    const output = level === 'error' ? console.error : console.log;
    output(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
