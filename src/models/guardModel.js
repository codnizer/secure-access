const db = require('../config/db');

class Guard {
  static async create({ fname, lname, assignedEmplacementId, phone }) {
    try {
      const res = await db.query(
        'INSERT INTO Guard (fname, lname, assignedEmplacementId, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [fname, lname, assignedEmplacementId, phone]
      );
      return res.rows[0];
    } catch (error) {
      throw error; // Re-throw for controller to handle
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM Guard');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM Guard WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === 'assignedEmplacementId' && updates[key] === null) {
          // Allow setting FK to null
          values.push(null);
        } else {
          values.push(updates[key]);
        }
        fields.push(`${key} = $${queryIndex++}`);
      }
    }

    if (fields.length === 0) {
      return null; // No fields to update
    }

    values.push(id); // Add ID for the WHERE clause
    const res = await db.query(
      `UPDATE Guard SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`,
      values
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM Guard WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = Guard;