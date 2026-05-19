import { App, LogLevel } from '@slack/bolt';
import { appConfig } from './config/index.js';
import { logger } from './utils/logger.js';
import { registerCommands } from './handlers/commands.js';
import { registerViews } from './handlers/views.js';
import { registerActions } from './handlers/actions.js';
import { registerEvents } from './handlers/events.js';
import { ClientRepository } from './repositories/ClientRepository.js';
import { DepartmentRepository } from './repositories/DepartmentRepository.js';
import { RoleTitleRepository } from './repositories/RoleTitleRepository.js';

const clientRepo = new ClientRepository();
const deptRepo = new DepartmentRepository();
const roleRepo = new RoleTitleRepository();

export function createApp() {
  const boltConfig = {
    token: appConfig.slack.botToken,
    signingSecret: appConfig.slack.signingSecret,
    logLevel: appConfig.isDev ? LogLevel.WARN : LogLevel.ERROR,
    logger: {
      debug: (msg) => logger.debug(msg),
      info:  (msg) => logger.info(msg),
      warn:  (msg) => logger.warn(msg),
      error: (msg) => logger.error(msg),
      setLevel: () => {},
      setName:  () => {},
      getLevel: () => LogLevel.WARN,
    },
  };

  if (appConfig.slack.useSocketMode) {
    boltConfig.socketMode = true;
    boltConfig.appToken   = appConfig.slack.appToken;
  } else {
    boltConfig.port = appConfig.port;
  }

  const app = new App(boltConfig);

  registerCommands(app);
  registerViews(app);
  registerActions(app);
  registerEvents(app);

  // ── External select: Client search ─────────────────────────────────────────
  app.options('client_name_search', async ({ options, ack }) => {
    const query = options.value ?? '';
    try {
      const opts = await clientRepo.searchOptions(query);
      await ack({ options: opts });
    } catch (err) {
      logger.warn('client_name_search options failed', { error: err.message });
      const defaultName = appConfig.companyName ?? 'GSD';
      await ack({ options: [{ text: { type: 'plain_text', text: `${defaultName} (Sin cliente)` }, value: defaultName }] });
    }
  });

  // ── External select: Department search ──────────────────────────────────────
  app.options('department_search', async ({ options, ack }) => {
    const query = options.value ?? '';
    try {
      const rows = deptRepo.search(query);
      const opts = rows.map((r) => ({
        text:  { type: 'plain_text', text: r.name.substring(0, 75) },
        value: r.name.substring(0, 75),
      }));
      await ack({ options: opts });
    } catch (err) {
      logger.warn('department_search options failed', { error: err.message });
      await ack({ options: [] });
    }
  });

  // ── External select: Role title search ──────────────────────────────────────
  app.options('role_title_search', async ({ options, ack }) => {
    const query = options.value ?? '';
    try {
      const rows = roleRepo.search(query);
      const opts = rows.map((r) => ({
        text:  { type: 'plain_text', text: r.name.substring(0, 75) },
        value: r.name.substring(0, 75),
      }));
      await ack({ options: opts });
    } catch (err) {
      logger.warn('role_title_search options failed', { error: err.message });
      await ack({ options: [] });
    }
  });

  // ── External select: Manager (admin users only) ──────────────────────────────
  app.options('manager_search', async ({ options, ack, client }) => {
    const query = (options.value ?? '').toLowerCase();
    try {
      // Fetch all users and filter for admins / owners
      const result = await client.users.list({ limit: 200 });
      const adminUsers = (result.members ?? []).filter(
        (u) => !u.deleted && !u.is_bot && (u.is_admin || u.is_owner || u.is_primary_owner)
      );

      const filtered = query
        ? adminUsers.filter((u) => {
            const name = (u.real_name ?? u.name ?? '').toLowerCase();
            return name.includes(query);
          })
        : adminUsers;

      const opts = filtered.slice(0, 25).map((u) => ({
        text:  { type: 'plain_text', text: u.real_name ?? u.name },
        value: u.id,
      }));

      await ack({ options: opts });
    } catch (err) {
      logger.warn('manager_search options failed', { error: err.message });
      await ack({ options: [] });
    }
  });

  // ── Health check (HTTP mode only) ────────────────────────────────────────────
  if (!appConfig.slack.useSocketMode) {
    app.receiver.router.get('/healthz', (_req, res) => {
      res.json({ status: 'ok', uptime: process.uptime(), ts: Date.now() });
    });

    app.receiver.router.get('/api/hubspot-companies', async (req, res) => {
      const q = req.query.q ?? '';
      try {
        const { hubspot } = await import('./integrations/hubspot.js');
        const companies = await hubspot.searchCompanies(q);
        res.json({ ok: true, companies });
      } catch (err) {
        res.json({ ok: false, companies: [] });
      }
    });
  }

  app.error(async (error) => {
    logger.error('Unhandled Bolt error', { error: error.message, stack: error.stack });
  });

  return app;
}
