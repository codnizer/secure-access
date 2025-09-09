const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // To generate UUIDs if needed on the application layer
const crypto = require('crypto'); // For generating PINs and QR codes

class Personnel {
  /**
   * Generates a 6-digit numeric PIN for access control
   */
  static generatePin() {
    // Generate a 6-digit numeric PIN (000000-999999)
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
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
    phone,
    service,
    photoEmbeddings,
    fingerprintEmbeddings,
    isActive = true, // Default to true
  }) {
    const generatedPin = pin || Personnel.generatePin();
    const qrCode = Personnel.generateQrCode(); // Always generate a new QR code

    try {
      const res = await db.query(
        `INSERT INTO Personnel (national_id, fname, lname, photoUrl, qrCode, pin,
                                phone, service, photoEmbeddings,
                                fingerprintEmbeddings, isActive)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          national_id,
          fname,
          lname,
          photoUrl,
          qrCode,
          generatedPin, 
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
        if (error.detail.includes('pin')) {
          throw new Error('PIN collision, please try again.');
        }
      }
      throw error;
    }
  }

  static async findAll() {
    const res = await db.query('SELECT * FROM Personnel ORDER BY fname, lname');
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

  /**
   * NEW: Find personnel by PIN - for PIN-based access
   */
  static async findByPin(pin) {
    const res = await db.query(
      'SELECT * FROM Personnel WHERE pin = $1 AND isActive = true', 
      [pin]
    );
    return res.rows[0];
  }

  /**
   * NEW: Find personnel by national ID
   */
  static async findByNationalId(national_id) {
    const res = await db.query('SELECT * FROM Personnel WHERE national_id = $1', [national_id]);
    return res.rows[0];
  }

  /**
   * NEW: Search personnel by name or national ID
   */
  static async search(searchTerm) {
    const res = await db.query(
      `SELECT * FROM Personnel 
       WHERE LOWER(fname) LIKE LOWER($1) 
          OR LOWER(lname) LIKE LOWER($1) 
          OR national_id LIKE $1
       ORDER BY fname, lname`,
      [`%${searchTerm}%`]
    );
    return res.rows;
  }

  /**
   * NEW: Get active personnel only
   */
  static async findAllActive() {
    const res = await db.query('SELECT * FROM Personnel WHERE isActive = true ORDER BY fname, lname');
    return res.rows;
  }

  /**
   * NEW: Update personnel status (active/inactive)
   */
  static async updateStatus(id, isActive) {
    const res = await db.query(
      'UPDATE Personnel SET isActive = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    return res.rows[0];
  }

  /**
   * NEW: Generate new PIN for personnel
   */
  static async regeneratePin(id) {
    const newPin = Personnel.generatePin();
    
    try {
      const res = await db.query(
        'UPDATE Personnel SET pin = $1 WHERE id = $2 RETURNING *',
        [newPin, id]
      );
      return res.rows[0];
    } catch (error) {
      if (error.code === '23505' && error.detail.includes('pin')) {
        // If PIN collision, try again recursively
        return Personnel.regeneratePin(id);
      }
      throw error;
    }
  }

  /**
   * NEW: Generate new QR code for personnel
   */
  static async regenerateQrCode(id) {
    const newQrCode = Personnel.generateQrCode();
    
    try {
      const res = await db.query(
        'UPDATE Personnel SET qrCode = $1 WHERE id = $2 RETURNING *',
        [newQrCode, id]
      );
      return res.rows[0];
    } catch (error) {
      if (error.code === '23505' && error.detail.includes('qrCode')) {
        // If QR collision, try again recursively
        return Personnel.regenerateQrCode(id);
      }
      throw error;
    }
  }

  /**
   * NEW: Update photo embeddings after face recognition processing
   */
  static async updatePhotoEmbeddings(id, embeddings) {
    const res = await db.query(
      'UPDATE Personnel SET photoEmbeddings = $1 WHERE id = $2 RETURNING *',
      [embeddings, id]
    );
    return res.rows[0];
  }

  /**
   * NEW: Get personnel with their access permissions
   */
  static async findByIdWithAccess(id) {
    const query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'emplacementId', pe.emplacementid,
              'emplacementName', e.name,
              'emplacementType', e.type,
              'expirationDate', pe.expirationdate,
              'isExpired', CASE 
                WHEN pe.expirationdate IS NULL THEN false
                WHEN pe.expirationdate <= NOW() THEN true
                ELSE false
              END
            )
          ) FILTER (WHERE pe.emplacementid IS NOT NULL),
          '[]'::json
        ) as access_permissions
      FROM Personnel p
      LEFT JOIN PersonnelEmplacements pe ON p.id = pe.personnelid
      LEFT JOIN Emplacement e ON pe.emplacementid = e.id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const res = await db.query(query, [id]);
    return res.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        let value = updates[key];

        // Handle special cases for data types
        if (key === 'photoEmbeddings' || key === 'fingerprintEmbeddings') {
          // Handle embeddings - can be array or string
          if (Array.isArray(value)) {
            value = `[${value.join(',')}]`;
          } else if (typeof value === 'string' && value.startsWith('[')) {
            // Already formatted, keep as is
            value = value;
          } else if (value) {
            // Assume it's a JSON string that needs parsing
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                value = `[${parsed.join(',')}]`;
              }
            } catch (e) {
              // If parsing fails, keep original value
            }
          }
        }

        values.push(value);
        fields.push(`${key} = $${queryIndex++}`);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    
    try {
      const res = await db.query(
        `UPDATE Personnel SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`,
        values
      );
      return res.rows[0];
    } catch (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.detail.includes('national_id')) {
          throw new Error('Personnel with this National ID already exists.');
        }
        if (error.detail.includes('pin')) {
          throw new Error('PIN already in use by another personnel.');
        }
        if (error.detail.includes('qrCode')) {
          throw new Error('QR Code already in use.');
        }
      }
      throw error;
    }
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM Personnel WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }

  /**
   * NEW: Soft delete - set as inactive instead of removing from database
   */
  static async softDelete(id) {
    const res = await db.query(
      'UPDATE Personnel SET isActive = false WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0];
  }

  /**
   * NEW: Get statistics about personnel
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE isActive = true) as active,
        COUNT(*) FILTER (WHERE isActive = false) as inactive,
        COUNT(DISTINCT service) as services
      FROM Personnel
    `;
    
    const res = await db.query(query);
    return res.rows[0];
  }

  /**
   * NEW: Validate personnel credentials for multi-factor authentication
   */
  static async validateCredentials(personnelId, credentials) {
    const personnel = await Personnel.findById(personnelId);
    if (!personnel || !personnel.isactive) {
      return { valid: false, message: 'Personnel not found or inactive' };
    }

    const results = {};

    // Validate QR code if provided
    if (credentials.qrCode) {
      results.qr = personnel.qrcode === credentials.qrCode;
    }

    // Validate PIN if provided
    if (credentials.pin) {
      results.pin = personnel.pin === credentials.pin;
    }

    // For photo validation, you would typically compare embeddings
    if (credentials.photoEmbeddings) {
      // This would involve comparing the embeddings using cosine similarity
      // For now, just check if embeddings exist
      results.photo = !!personnel.photoembeddings;
    }

    const allValid = Object.values(results).every(Boolean);
    
    return {
      valid: allValid,
      results,
      personnel: allValid ? personnel : null
    };
  }
}

module.exports = Personnel;
