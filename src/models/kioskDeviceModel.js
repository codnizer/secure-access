const db = require('../config/db');

class KioskDevice {
  static async create({ assignedEmplacementId, isOnline = false }) {
    try {
      const res = await db.query(
        'INSERT INTO KioskDevice (assignedEmplacementId, isOnline) VALUES ($1, $2) RETURNING *',
        [assignedEmplacementId, isOnline]
      );
      return res.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM KioskDevice');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM KioskDevice WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === 'assignedEmplacementId' && updates[key] === null) {
          values.push(null);
        } else {
          values.push(updates[key]);
        }
        fields.push(`${key} = $${queryIndex++}`);
      }
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const res = await db.query(
      `UPDATE KioskDevice SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`,
      values
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM KioskDevice WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = KioskDevice;