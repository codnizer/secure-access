const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // To generate UUIDs if needed on the application layer
const crypto = require('crypto'); // For generating PINs and QR codes

class Personnel {
  /**
   * Generates a simple 6-digit PIN. In a real system, you might want more complex generation.
   */
  static generatePin() {
    return crypto.randomBytes(3).toString('hex').slice(0, 6); // Simple 6-char hex string
  }

  /**
   * Generates a unique QR code string. For now, it's just a UUID.
   * In a real system, this might encode actual data and be more robust.
   */
  static generateQrCode() {
    return uuidv4();
  }

  static async create({
    national_id,
    fname,
    lname,
    photoUrl,
    pin, // PIN can be provided or generated
    expirationDate,
    assignedEmplacementId, // This should be a valid Emplacement UUID
    phone,
    service,
    photoEmbeddings,
    fingerprintEmbeddings,
    isActive = true, // Default to true
  }) {
    const generatedPin = pin || Personnel.generatePin();
    const qrCode = Personnel.generateQrCode(); // Always generate a new QR code

    // Ensure expirationDate is a proper timestamp string
    const expDate = new Date(expirationDate).toISOString();

    try {
      const res = await db.query(
        `INSERT INTO Personnel (national_id, fname, lname, photoUrl, qrCode, pin, expirationDate,
                                assignedEmplacementId, phone, service, photoEmbeddings,
                                fingerprintEmbeddings, isActive)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          national_id,
          fname,
          lname,
          photoUrl,
          qrCode,
          generatedPin,
          expDate,
          assignedEmplacementId,
          phone,
          service,
          photoEmbeddings,
          fingerprintEmbeddings,
          isActive,
        ]
      );
      return res.rows[0];
    } catch (error) {
      // Check for unique constraint violation
      if (error.code === '23505') { // unique_violation
        if (error.detail.includes('national_id')) {
          throw new Error('Personnel with this National ID already exists.');
        }
        if (error.detail.includes('qrCode')) {
          throw new Error('QR Code collision, please try again.'); // Should be rare with UUID, but handle it
        }
      }
      throw error;
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM Personnel');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM Personnel WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async findByQrCode(qrCode) {
    const res = await db.query('SELECT * FROM Personnel WHERE qrCode = $1', [qrCode]);
    return res.rows[0];
  }

static async update(id, updates) {
  const fields = [];
  const values = [];
  let queryIndex = 1;

  for (const key in updates) {
    if (updates.hasOwnProperty(key)) {
      let value = updates[key];

      if (key === 'expirationDate') {
        value = new Date(value).toISOString();
      } else if (key === 'assignedEmplacementId' && value === null) {
        value = null;
      } else if (key === 'photoEmbeddings' || key === 'fingerprintEmbeddings') {
        if (!Array.isArray(value)) {
          throw new Error(`${key} must be an array of numbers`);
        }
        // Convert numeric array to PostgreSQL vector literal format: '[num1,num2,...]'
        value = `[${value.join(',')}]`;
      }

      values.push(value);
      fields.push(`${key} = $${queryIndex++}`);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const res = await db.query(
    `UPDATE Personnel SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`,
    values
  );

  return res.rows[0];
}




  static async delete(id) {
    const res = await db.query('DELETE FROM Personnel WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
}

module.exports = Personnel;