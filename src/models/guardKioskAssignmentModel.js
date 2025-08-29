const db = require('../config/db');

class GuardKioskAssignment {
  static async create({ guardId, kioskDeviceId }) {
    try {
      const res = await db.query(
        'INSERT INTO GuardKioskAssignment (guardId, kioskDeviceId) VALUES ($1, $2) RETURNING *',
        [guardId, kioskDeviceId]
      );
      return res.rows[0];
    } catch (error) {
      // Check for unique constraint violation (a guard already assigned to this kiosk)
      if (error.code === '23505') { // unique_violation
        throw new Error('This guard is already assigned to this kiosk device.');
      }
      throw error;
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM GuardKioskAssignment');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM GuardKioskAssignment WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async findByGuardAndKiosk(guardId, kioskDeviceId) {
    const res = await db.query(
      'SELECT * FROM GuardKioskAssignment WHERE guardId = $1 AND kioskDeviceId = $2',
      [guardId, kioskDeviceId]
    );
    return res.rows[0];
  }

  // Update operation typically doesn't make sense for a simple join table if the keys define the uniqueness.
  // Instead, you'd delete the old and create a new one if guardId or kioskDeviceId changes.
  // For simplicity, we'll omit a direct "update" for the foreign keys here,
  // but you could add one if other fields were added to the assignment entity.

  static async delete(id) {
    const res = await db.query('DELETE FROM GuardKioskAssignment WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = GuardKioskAssignment;