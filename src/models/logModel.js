const db = require('../config/db');
const { createHash } = require('../utils/hasher');

class Log {
  static async create({ type, personnelId, emplacementId, method, success, date = new Date() }) {
    // Data to be hashed for the log entry
    const logData = {
      type,
      personnelId,
      emplacementId,
      method,
      success,
      date: date.toISOString(), // Ensure consistent date string for hashing
    };
    const hash = createHash(logData);

    try {
      const res = await db.query(
        'INSERT INTO Log (type, personnelId, emplacementId, method, success, date, hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [type, personnelId, emplacementId, method, success, date, hash]
      );
      return res.rows[0];
    } catch (error) {
      if (error.code === '23505' && error.detail.includes('hash')) {
        throw new Error('Log entry with this hash already exists (duplicate entry).');
      }
      throw error;
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM Log');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM Log WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async findByHash(hash) {
    const res = await db.query('SELECT * FROM Log WHERE hash = $1', [hash]);
    return res.rows[0];
  }

  // Update and Delete operations for Log are generally discouraged in a blockchain context
  // as logs should be immutable. For now, we'll omit them to enforce this principle.
  // If your system needs to correct or "invalidate" logs, it should be done through new,
  // compensating log entries, not by modifying existing ones.

  // If you *must* have update/delete for development/testing, uncomment and implement similar
  // to other models, but be aware of the implications for immutability.
  /*
  static async update(id, updates) { ... }
  static async delete(id) { ... }
  */
}

module.exports = Log;