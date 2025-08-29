const KioskDevice = require('../models/kioskDeviceModel');
const Emplacement = require('../models/emplacementModel'); // To validate Emplacement ID

exports.createKioskDevice = async (req, res) => {
  try {
    const { assignedEmplacementId, isOnline } = req.body;

    // assignedEmplacementId is not strictly required upon creation per UML, but often is practical
    // For now, let's make it optional. If provided, validate it.
    if (assignedEmplacementId) {
      const emplacementExists = await Emplacement.findById(assignedEmplacementId);
      if (!emplacementExists) {
        return res.status(400).json({ message: 'Invalid assignedEmplacementId: Emplacement does not exist' });
      }
    }

    const newKioskDevice = await KioskDevice.create({ assignedEmplacementId, isOnline });
    res.status(201).json(newKioskDevice);
  } catch (error) {
    console.error('Error creating kiosk device:', error);
    res.status(500).json({ message: 'Error creating kiosk device', error: error.message });
  }
};

exports.getAllKioskDevices = async (req, res) => {
  try {
    const kioskDevices = await KioskDevice.findAll();
    res.status(200).json(kioskDevices);
  } catch (error) {
    console.error('Error fetching kiosk devices:', error);
    res.status(500).json({ message: 'Error fetching kiosk devices', error: error.message });
  }
};

exports.getKioskDeviceById = async (req, res) => {
  try {
    const kioskDevice = await KioskDevice.findById(req.params.id);
    if (!kioskDevice) {
      return res.status(404).json({ message: 'Kiosk device not found' });
    }
    res.status(200).json(kioskDevice);
  } catch (error) {
    console.error('Error fetching kiosk device by ID:', error);
    res.status(500).json({ message: 'Error fetching kiosk device', error: error.message });
  }
};

exports.updateKioskDevice = async (req, res) => {
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

    const updatedKioskDevice = await KioskDevice.update(req.params.id, updates);
    if (!updatedKioskDevice) {
      return res.status(404).json({ message: 'Kiosk device not found or no fields to update' });
    }
    res.status(200).json(updatedKioskDevice);
  } catch (error) {
    console.error('Error updating kiosk device:', error);
    res.status(500).json({ message: 'Error updating kiosk device', error: error.message });
  }
};

exports.deleteKioskDevice = async (req, res) => {
  try {
    const deletedKioskDevice = await KioskDevice.delete(req.params.id);
    if (!deletedKioskDevice) {
      return res.status(404).json({ message: 'Kiosk device not found' });
    }
    res.status(200).json({ message: 'Kiosk device deleted successfully', deletedKioskDevice });
  } catch (error) {
    console.error('Error deleting kiosk device:', error);
    res.status(500).json({ message: 'Error deleting kiosk device', error: error.message });
  }
};