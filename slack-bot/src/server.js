import http from 'http';
import { runMigrations } from './db/migrations.js';
import { closeDb } from './db/connection.js';
import { createApp } from './app.js';
import { appConfig } from './config/index.js';
import { logger } from './utils/logger.js';

async function main() {
  logger.info('Starting Onboarding/Offboarding Bot', { env: appConfig.env });

  // Run DB migrations (idempotent)
  runMigrations();

  const app = createApp();

  // Start the Bolt app
  if (appConfig.slack.useSocketMode) {
    await app.start();
    logger.info('Bot started in Socket Mode');

    // Health / readiness HTTP server — required by Railway and Docker HEALTHCHECK
    // Bolt doesn't expose HTTP in Socket Mode, so we start a minimal server.
    const healthServer = http.createServer((req, res) => {
      if (req.url === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: Math.floor(process.uptime()) }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    healthServer.listen(appConfig.port, () => {
      logger.info(`Health server listening on port ${appConfig.port}`);
    });
  } else {
    await app.start(appConfig.port);
    logger.info(`Bot started on port ${appConfig.port}`);
  }

  // Fetch team info to use as default client name
  try {
    const auth = await app.client.auth.test();
    appConfig.companyName = auth.team || 'GSD';
    logger.info('Connected to Slack team', { team: auth.team, bot: auth.user });
  } catch (err) {
    logger.warn('Failed to fetch team info', { error: err.message });
    appConfig.companyName = 'GSD';
  }

  logger.info('Integrations status', {
    github: appConfig.github.enabled ? 'enabled' : 'disabled',
    google: appConfig.google.enabled ? 'enabled' : 'disabled',
    webhook: appConfig.webhook.enabled ? 'enabled' : 'disabled',
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    try {
      await app.stop();
    } catch (_) {}
    closeDb();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
