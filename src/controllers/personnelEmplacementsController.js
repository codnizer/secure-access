const PersonnelEmplacements = require('../models/PersonnelEmplacements');

exports.getAll = async (req, res) => {
  try {
    const data = await PersonnelEmplacements.getAll();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching PersonnelEmplacements:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.getByPersonnelId = async (req, res) => {
  try {
    const { personnelId } = req.params;
    const data = await PersonnelEmplacements.getByPersonnelId(personnelId);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching PersonnelEmplacements:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { personnelId, emplacementId, expirationDate } = req.body;
    const newRecord = await PersonnelEmplacements.add(personnelId, emplacementId, expirationDate);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error adding PersonnelEmplacement:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { personnelId, emplacementId } = req.body;
    const deleted = await PersonnelEmplacements.remove(personnelId, emplacementId);
    if (!deleted) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Deleted successfully', deleted });
  } catch (err) {
    console.error('Error deleting PersonnelEmplacement:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.updateExpiration = async (req, res) => {
  try {
    const { personnelId, emplacementId, expirationDate } = req.body;
    const updated = await PersonnelEmplacements.updateExpiration(personnelId, emplacementId, expirationDate);
    if (!updated) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating PersonnelEmplacement:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.getEmplacementsByPersonnelId = async (req, res) => {
  try {
    const { personnelId } = req.params;
    const data = await PersonnelEmplacements.getEmplacementsByPersonnelId(personnelId);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching personnel emplacements:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.bulkUpdateAccess = async (req, res) => {
  try {
    const { personnelId, emplacements } = req.body;
    // emplacements should be an array of {emplacementId, expirationDate, hasAccess}
    
    const result = await PersonnelEmplacements.bulkUpdateAccess(personnelId, emplacements);
    res.status(200).json({ message: 'Access updated successfully', result });
  } catch (err) {
    console.error('Error updating personnel access:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const { personnelId, emplacementId } = req.query;
    
    if (!personnelId || !emplacementId) {
      return res.status(400).json({ message: 'personnelId and emplacementId are required' });
    }

    // Check if personnel has access
    const accessRecord = await PersonnelEmplacements.getByPersonnelId(personnelId);
    const emplacementAccess = accessRecord.find(access => access.emplacementid === emplacementId);
    
    if (!emplacementAccess) {
      return res.json({ 
        hasAccess: false, 
        isExpired: false 
      });
    }

    // Check if access has expired
    const isExpired = emplacementAccess.expirationdate && 
      new Date(emplacementAccess.expirationdate) < new Date();

    res.json({ 
      hasAccess: true, 
      isExpired: !!isExpired,
      expirationDate: emplacementAccess.expirationdate 
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ message: 'Error checking access', error: error.message });
  }
};