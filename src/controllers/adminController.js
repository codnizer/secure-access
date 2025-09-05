const Admin = require('../models/adminModel');

exports.createAdmin = async (req, res) => {
  try {
    const { fname, lname, email, phone, password } = req.body;

    if (!fname || !lname || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: fname, lname, email, password' });
    }

    // Check if an admin with this email already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }

    const newAdmin = await Admin.create({ fname, lname, email, phone, password });
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error fetching admin by ID:', error);
    res.status(500).json({ message: 'Error fetching admin', error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await Admin.update(req.params.id, req.body);
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found or no fields to update' });
    }
    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.delete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Admin deleted successfully', deletedAdmin });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Add this to your adminController
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin with password included
    const admin = await Admin.findByEmailWithPassword(email);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: adminWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};