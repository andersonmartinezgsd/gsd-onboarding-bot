import { getDb } from '../db/connection.js';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class ClientRepository {
  get db() { return getDb(); }

  findAll() {
    return this.db
      .prepare('SELECT * FROM clients WHERE is_active = 1 ORDER BY name ASC')
      .all();
  }

  search(query = '') {
    const like = `%${query}%`;
    return this.db
      .prepare('SELECT * FROM clients WHERE is_active = 1 AND name LIKE ? ORDER BY name ASC LIMIT 25')
      .all(like);
  }

  findByName(name) {
    return this.db.prepare('SELECT * FROM clients WHERE name = ?').get(name) ?? null;
  }

  findOrCreate(name, source = 'local', externalId = null) {
    const trimmed = name.trim();
    const existing = this.findByName(trimmed);
    if (existing) return existing;

    return this.db
      .prepare('INSERT INTO clients (name, source, external_id) VALUES (?, ?, ?) RETURNING *')
      .get(trimmed, source, externalId);
  }

  /**
   * Returns options for the Slack external_select depending on CLIENT_DATA_SOURCE config.
   * Falls back to local DB if external sources fail.
   */
  async searchOptions(query = '') {
    const source = appConfig.clients.dataSource;

    if (source === 'hubspot') {
      return this._searchHubspot(query);
    }

    if (source === 'api') {
      return this._searchExternalApi(query);
    }

    // Default: local DB
    const rows = this.search(query);
    const companyName = appConfig.companyName;

    // GSD is always the first option
    const gsdOption = { text: { type: 'plain_text', text: `${companyName} (Sin cliente)` }, value: companyName };
    const rest = rows
      .filter((r) => r.name.toLowerCase() !== companyName.toLowerCase())
      .map((r) => ({ text: { type: 'plain_text', text: r.name.substring(0, 75) }, value: r.name.substring(0, 75) }));

    return [gsdOption, ...rest];
  }

  async _searchHubspot(query) {
    const companyName = appConfig.companyName;
    const defaultOpt = { text: { type: 'plain_text', text: `${companyName} (Sin cliente)` }, value: companyName };
    try {
      const { hubspot } = await import('../integrations/hubspot.js');
      const companies = await hubspot.searchCompanies(query);
      const opts = companies
        .filter((c) => c.name.toLowerCase() !== companyName.toLowerCase())
        .map((c) => ({ text: { type: 'plain_text', text: c.name.substring(0, 75) }, value: c.name.substring(0, 75) }));
      return [defaultOpt, ...opts];
    } catch (err) {
      logger.warn('HubSpot client search failed, falling back to DB', { error: err.message });
      const rows = this.search(query);
      const rest = rows
        .filter((r) => r.name.toLowerCase() !== companyName.toLowerCase())
        .map((r) => ({ text: { type: 'plain_text', text: r.name.substring(0, 75) }, value: r.name.substring(0, 75) }));
      return [defaultOpt, ...rest];
    }
  }

  async _searchExternalApi(query) {
    const companyName = appConfig.companyName;
    const defaultOpt = { text: { type: 'plain_text', text: `${companyName} (Sin cliente)` }, value: companyName };
    const { apiUrl, apiToken } = appConfig.clients;
    if (!apiUrl) return [defaultOpt];

    try {
      const { default: axios } = await import('axios');
      const { data } = await axios.get(apiUrl, {
        params: { q: query, limit: 25 },
        headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        timeout: 5000,
      });
      const items = Array.isArray(data) ? data : (data.results ?? data.data ?? []);
      const opts = items
        .filter((c) => (c.name ?? c).toLowerCase() !== companyName.toLowerCase())
        .map((c) => {
          const name = (c.name ?? c).substring(0, 75);
          return { text: { type: 'plain_text', text: name }, value: name };
        });
      return [defaultOpt, ...opts];
    } catch (err) {
      logger.warn('External client API search failed, falling back to DB', { error: err.message });
      const rows = this.search(query);
      const rest = rows
        .filter((r) => r.name.toLowerCase() !== companyName.toLowerCase())
        .map((r) => ({ text: { type: 'plain_text', text: r.name.substring(0, 75) }, value: r.name.substring(0, 75) }));
      return [defaultOpt, ...rest];
    }
  }
}
