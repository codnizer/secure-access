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

  // New method for getting all emplacements with access status for a specific personnel
  async getEmplacementsByPersonnelId(personnelId) {
    const query = `
      SELECT 
        e.id,
        e.name,
        e.type,
        e.accessmethod,
        e.exitmethod,
        pe.expirationdate,
        CASE WHEN pe.personnelid IS NOT NULL THEN true ELSE false END as hasAccess
      FROM Emplacement e
      LEFT JOIN PersonnelEmplacements pe ON e.id = pe.emplacementid AND pe.personnelid = $1
      ORDER BY e.name
    `;
    
    const result = await db.query(query, [personnelId]);
    return result.rows;
  },

  // FIXED: New method for bulk updating access permissions
  async bulkUpdateAccess(personnelId, emplacements) {
    // Use db.pool.connect() instead of db.connect()
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Remove all existing access for this personnel
      await client.query(
        'DELETE FROM personnelemplacements WHERE personnelid = $1',
        [personnelId]
      );
      
      // Add new access records
      for (const emp of emplacements) {
        if (emp.hasAccess) {
          await client.query(
            'INSERT INTO personnelemplacements (personnelid, emplacementid, expirationdate) VALUES ($1, $2, $3)',
            [personnelId, emp.emplacementId, emp.expirationDate]
          );
        }
      }
      
      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Additional helper method to check if personnel has access to specific emplacement
  async hasAccess(personnelId, emplacementId) {
    const res = await db.query(
      `SELECT * FROM personnelemplacements 
       WHERE personnelid = $1 AND emplacementid = $2 
       AND (expirationdate IS NULL OR expirationdate > NOW())`,
      [personnelId, emplacementId]
    );
    return res.rows.length > 0;
  },

  // Method to get expired accesses for cleanup
  async getExpiredAccess() {
    const res = await db.query(
      `SELECT * FROM personnelemplacements 
       WHERE expirationdate IS NOT NULL AND expirationdate <= NOW()`
    );
    return res.rows;
  },

  // Method to clean up expired accesses
  async cleanupExpiredAccess() {
    const res = await db.query(
      `DELETE FROM personnelemplacements 
       WHERE expirationdate IS NOT NULL AND expirationdate <= NOW()
       RETURNING *`
    );
    return res.rows;
  }
};

module.exports = PersonnelEmplacements;
