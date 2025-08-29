const Guard = require('../models/guardModel');
const Emplacement = require('../models/emplacementModel'); // To validate Emplacement ID

exports.createGuard = async (req, res) => {
  try {
    const { fname, lname, assignedEmplacementId, phone } = req.body;

    if (!fname || !lname) {
      return res.status(400).json({ message: 'Missing required fields: fname, lname' });
    }

    // Validate assignedEmplacementId if provided
    if (assignedEmplacementId) {
      const emplacementExists = await Emplacement.findById(assignedEmplacementId);
      if (!emplacementExists) {
        return res.status(400).json({ message: 'Invalid assignedEmplacementId: Emplacement does not exist' });
      }
    }

    const newGuard = await Guard.create({ fname, lname, assignedEmplacementId, phone });
    res.status(201).json(newGuard);
  } catch (error) {
    console.error('Error creating guard:', error);
    res.status(500).json({ message: 'Error creating guard', error: error.message });
  }
};

exports.getAllGuards = async (req, res) => {
  try {
    const guards = await Guard.findAll();
    res.status(200).json(guards);
  } catch (error) {
    console.error('Error fetching guards:', error);
    res.status(500).json({ message: 'Error fetching guards', error: error.message });
  }
};

exports.getGuardById = async (req, res) => {
  try {
    const guard = await Guard.findById(req.params.id);
    if (!guard) {
      return res.status(404).json({ message: 'Guard not found' });
    }
    res.status(200).json(guard);
  } catch (error) {
    console.error('Error fetching guard by ID:', error);
    res.status(500).json({ message: 'Error fetching guard', error: error.message });
  }
};

exports.updateGuard = async (req, res) => {
  try {
    const { assignedEmplacementId, ...updates } = req.body;

    // Validate assignedEmplacementId if provided
    if (assignedEmplacementId !== undefined && assignedEmplacementId !== null) {
      const emplacementExists = await Emplacement.findById(assignedEmplacementId);
      if (!emplacementExists) {
        return res.status(400).json({ message: 'Invalid assignedEmplacementId: Emplacement does not exist' });
      }
    }
    // Re-add assignedEmplacementId to updates if it was valid or null
    if (assignedEmplacementId !== undefined) {
      updates.assignedEmplacementId = assignedEmplacementId;
    }

    const updatedGuard = await Guard.update(req.params.id, updates);
    if (!updatedGuard) {
      return res.status(404).json({ message: 'Guard not found or no fields to update' });
    }
    res.status(200).json(updatedGuard);
  } catch (error) {
    console.error('Error updating guard:', error);
    res.status(500).json({ message: 'Error updating guard', error: error.message });
  }
};

exports.deleteGuard = async (req, res) => {
  try {
    const deletedGuard = await Guard.delete(req.params.id);
    if (!deletedGuard) {
      return res.status(404).json({ message: 'Guard not found' });
    }
    res.status(200).json({ message: 'Guard deleted successfully', deletedGuard });
  } catch (error) {
    console.error('Error deleting guard:', error);
    res.status(500).json({ message: 'Error deleting guard', error: error.message });
  }
};