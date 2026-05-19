import { getDb } from '../db/connection.js';

export class DepartmentRepository {
  get db() { return getDb(); }

  findAll(includeInactive = false) {
    const sql = includeInactive
      ? 'SELECT * FROM departments ORDER BY name ASC'
      : 'SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC';
    return this.db.prepare(sql).all();
  }

  search(query = '') {
    const like = `%${query}%`;
    return this.db
      .prepare('SELECT * FROM departments WHERE is_active = 1 AND name LIKE ? ORDER BY name ASC LIMIT 25')
      .all(like);
  }

  findByName(name) {
    return this.db.prepare('SELECT * FROM departments WHERE name = ?').get(name) ?? null;
  }

  findOrCreate(name) {
    const trimmed = name.trim();
    const existing = this.findByName(trimmed);
    if (existing) return existing;

    const result = this.db
      .prepare('INSERT INTO departments (name) VALUES (?) RETURNING *')
      .get(trimmed);
    return result;
  }
}
