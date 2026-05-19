import { getDb } from '../db/connection.js';

export class RoleTitleRepository {
  get db() { return getDb(); }

  findAll(includeInactive = false) {
    const sql = includeInactive
      ? 'SELECT * FROM role_titles ORDER BY name ASC'
      : 'SELECT * FROM role_titles WHERE is_active = 1 ORDER BY name ASC';
    return this.db.prepare(sql).all();
  }

  search(query = '') {
    const like = `%${query}%`;
    return this.db
      .prepare('SELECT * FROM role_titles WHERE is_active = 1 AND name LIKE ? ORDER BY name ASC LIMIT 25')
      .all(like);
  }

  findByName(name) {
    return this.db.prepare('SELECT * FROM role_titles WHERE name = ?').get(name) ?? null;
  }

  findOrCreate(name) {
    const trimmed = name.trim();
    const existing = this.findByName(trimmed);
    if (existing) return existing;

    const result = this.db
      .prepare('INSERT INTO role_titles (name) VALUES (?) RETURNING *')
      .get(trimmed);
    return result;
  }
}
