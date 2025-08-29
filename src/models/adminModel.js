const db = require('../config/db');
const bcrypt = require('bcryptjs');

const saltRounds = 10; // Number of salt rounds for bcrypt

class Admin {
  static async create({ fname, lname, email, phone, password }) {
    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const res = await db.query(
      'INSERT INTO Admin (fname, lname, email, phone, passwordHash) VALUES ($1, $2, $3, $4, $5) RETURNING id, fname, lname, email, phone', // Exclude passwordHash from returned data
      [fname, lname, email, phone, passwordHash]
    );
    return res.rows[0];
  }

  static async findAll() {
    // Never return passwordHash
    const res = await db.query('SELECT id, fname, lname, email, phone FROM Admin');
    return res.rows;
  }

  static async findById(id) {
    // Never return passwordHash
    const res = await db.query('SELECT id, fname, lname, email, phone FROM Admin WHERE id = $1', [id]);
    return res.rows[0];
  }

  // Method to find admin by email (useful for login)
  static async findByEmail(email) {
    // This method *does* return passwordHash because it's needed for authentication comparison
    const res = await db.query('SELECT * FROM Admin WHERE email = $1', [email]);
    return res.rows[0];
  }

  static async update(id, { fname, lname, email, phone, password }) {
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (fname !== undefined) { fields.push(`fname = $${queryIndex++}`); values.push(fname); }
    if (lname !== undefined) { fields.push(`lname = $${queryIndex++}`); values.push(lname); }
    if (email !== undefined) { fields.push(`email = $${queryIndex++}`); values.push(email); }
    if (phone !== undefined) { fields.push(`phone = $${queryIndex++}`); values.push(phone); }
    if (passwordHash !== null) { fields.push(`passwordHash = $${queryIndex++}`); values.push(passwordHash); }

    if (fields.length === 0) {
      return null; // No fields to update
    }

    values.push(id); // Add ID for the WHERE clause
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

  // Method to compare a plain text password with a hashed password
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Admin;