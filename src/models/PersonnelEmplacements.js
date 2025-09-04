const db = require('../config/db');

const PersonnelEmplacements = {
  async getAll() {
    const res = await db.query('SELECT * FROM personnelemplacements');
    return res.rows;
  },

  async getByPersonnelId(personnelId) {
    const res = await db.query(
      'SELECT * FROM personnelemplacements WHERE personnelid = $1',
      [personnelId]
    );
    return res.rows;
  },

  async add(personnelId, emplacementId, expirationDate = null) {
    const res = await db.query(
      `INSERT INTO personnelemplacements (personnelid, emplacementid, expirationdate)
       VALUES ($1, $2, $3) RETURNING *`,
      [personnelId, emplacementId, expirationDate]
    );
    return res.rows[0];
  },

  async remove(personnelId, emplacementId) {
    const res = await db.query(
      `DELETE FROM personnelemplacements 
       WHERE personnelid = $1 AND emplacementid = $2 RETURNING *`,
      [personnelId, emplacementId]
    );
    return res.rows[0];
  },

  async updateExpiration(personnelId, emplacementId, expirationDate) {
    const res = await db.query(
      `UPDATE personnelemplacements
       SET expirationdate = $3
       WHERE personnelid = $1 AND emplacementid = $2
       RETURNING *`,
      [personnelId, emplacementId, expirationDate]
    );
    return res.rows[0];
  },
};

module.exports = PersonnelEmplacements;