const db = require('../config/db');

class Emplacement {
  static async create({ name, type, accessMethod, exitMethod }) {
    const res = await db.query(
      'INSERT INTO Emplacement (name, type, accessMethod, exitMethod) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, type, accessMethod, exitMethod]
    );
    return res.rows[0];
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM Emplacement');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM Emplacement WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async update(id, { name, type, accessMethod, exitMethod }) {
    const res = await db.query(
      'UPDATE Emplacement SET name = $1, type = $2, accessMethod = $3, exitMethod = $4 WHERE id = $5 RETURNING *',
      [name, type, accessMethod, exitMethod, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM Emplacement WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = Emplacement;