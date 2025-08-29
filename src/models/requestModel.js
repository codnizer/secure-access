const db = require('../config/db');

class Request {
  static async create({ type, personnelId, emplacementId, method, success, date = new Date() }) {
    try {
      const res = await db.query(
        'INSERT INTO Request (type, personnelId, emplacementId, method, success, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [type, personnelId, emplacementId, method, success, date]
      );
      return res.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM Request');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM Request WHERE id = $1', [id]);
    return res.rows[0];
  }

  // Update for Request might be less common, as it represents a discrete event,
  // but we can include it for completeness (e.g., correcting success status later).
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        values.push(updates[key]);
        fields.push(`${key} = $${queryIndex++}`);
      }
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const res = await db.query(
      `UPDATE Request SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`,
      values
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM Request WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = Request;