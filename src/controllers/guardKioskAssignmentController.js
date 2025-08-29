const GuardKioskAssignment = require('../models/guardKioskAssignmentModel');
const Guard = require('../models/guardModel'); // For validation
const KioskDevice = require('../models/kioskDeviceModel'); // For validation

exports.createGuardKioskAssignment = async (req, res) => {
  try {
    const { guardId, kioskDeviceId } = req.body;

    if (!guardId || !kioskDeviceId) {
      return res.status(400).json({ message: 'Missing required fields: guardId, kioskDeviceId' });
    }

    // Validate if Guard exists
    const guardExists = await Guard.findById(guardId);
    if (!guardExists) {
      return res.status(400).json({ message: 'Invalid guardId: Guard does not exist' });
    }

    // Validate if KioskDevice exists
    const kioskDeviceExists = await KioskDevice.findById(kioskDeviceId);
    if (!kioskDeviceExists) {
      return res.status(400).json({ message: 'Invalid kioskDeviceId: KioskDevice does not exist' });
    }

    const newAssignment = await GuardKioskAssignment.create({ guardId, kioskDeviceId });
    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating guard kiosk assignment:', error);
    if (error.message.includes('already assigned to this kiosk device')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating guard kiosk assignment', error: error.message });
  }
};

exports.getAllGuardKioskAssignments = async (req, res) => {
  try {
    const assignments = await GuardKioskAssignment.findAll();
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching guard kiosk assignments:', error);
    res.status(500).json({ message: 'Error fetching guard kiosk assignments', error: error.message });
  }
};

exports.getGuardKioskAssignmentById = async (req, res) => {
  try {
    const assignment = await GuardKioskAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Guard Kiosk Assignment not found' });
    }
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching guard kiosk assignment by ID:', error);
    res.status(500).json({ message: 'Error fetching guard kiosk assignment', error: error.message });
  }
};

exports.deleteGuardKioskAssignment = async (req, res) => {
  try {
    const deletedAssignment = await GuardKioskAssignment.delete(req.params.id);
    if (!deletedAssignment) {
      return res.status(404).json({ message: 'Guard Kiosk Assignment not found' });
    }
    res.status(200).json({ message: 'Guard Kiosk Assignment deleted successfully', deletedAssignment });
  } catch (error) {
    console.error('Error deleting guard kiosk assignment:', error);
    res.status(500).json({ message: 'Error deleting guard kiosk assignment', error: error.message });
  }
};