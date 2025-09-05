const db = require('../config/db');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

class Admin {
  static async create({ fname, lname, email, phone, password }) {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const res = await db.query(
      'INSERT INTO Admin (fname, lname, email, phone, passwordHash) VALUES ($1, $2, $3, $4, $5) RETURNING id, fname, lname, email, phone',
      [fname, lname, email, phone, passwordHash]
    );
    return res.rows[0];
  }

  static async findAll() {
    const res = await db.query('SELECT id, fname, lname, email, phone FROM Admin');
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query('SELECT id, fname, lname, email, phone FROM Admin WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async findByEmail(email) {
    const res = await db.query('SELECT id, fname, lname, email, phone FROM Admin WHERE email = $1', [email]);
    return res.rows[0];
  }

 static async findByEmailWithPassword(email) {
  const res = await db.query(
    'SELECT id, fname, lname, email, phone, passwordHash AS "passwordHash" FROM Admin WHERE email = $1', 
    [email]
  );
  return res.rows[0];
}

  static async update(id, { fname, lname, email, phone, password }) {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (fname !== undefined) { fields.push(`fname = $${queryIndex++}`); values.push(fname); }
    if (lname !== undefined) { fields.push(`lname = $${queryIndex++}`); values.push(lname); }
    if (email !== undefined) { fields.push(`email = $${queryIndex++}`); values.push(email); }
    if (phone !== undefined) { fields.push(`phone = $${queryIndex++}`); values.push(phone); }
    if (hashedPassword !== null) { fields.push(`passwordHash = $${queryIndex++}`); values.push(hashedPassword); }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const res = await db.query(
      `UPDATE Admin SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING id, fname, lname, email, phone`,
      values
    );
    return res.rows[0];
  }

  static async delete(id) {
    const res = await db.query('DELETE FROM Admin WHERE id = $1 RETURNING id, fname, lname, email, phone', [id]);
    return res.rows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    if (!hashedPassword) {
      throw new Error('Hashed password is undefined');
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Admin;