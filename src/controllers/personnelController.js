const Personnel = require('../models/personnelModel');
const Emplacement = require('../models/emplacementModel'); // To validate Emplacement ID

exports.createPersonnel = async (req, res) => {
  try {
    const {
      national_id,
      fname,
      lname,
      photoUrl,
      pin,
      expirationDate,
      assignedEmplacementId,
      phone,
      service,
      photoEmbeddings,
      fingerprintEmbeddings,
      isActive,
    } = req.body;

    // Basic validation for required fields
    if (!national_id || !fname || !lname || !expirationDate) {
      return res.status(400).json({ message: 'Missing required fields: national_id, fname, lname, expirationDate' });
    }

    // Validate assignedEmplacementId if provided
    if (assignedEmplacementId) {
      const emplacementExists = await Emplacement.findById(assignedEmplacementId);
      if (!emplacementExists) {
        return res.status(400).json({ message: 'Invalid assignedEmplacementId: Emplacement does not exist' });
      }
    }

       const formattedPhotoEmbeddings = Array.isArray(photoEmbeddings) 
      ? `[${photoEmbeddings.join(',')}]` 
      : photoEmbeddings;

    const formattedFingerprintEmbeddings = Array.isArray(fingerprintEmbeddings) 
      ? `[${fingerprintEmbeddings.join(',')}]` 
      : fingerprintEmbeddings;


    const newPersonnel = await Personnel.create({
      national_id,
      fname,
      lname,
      photoUrl,
      
      expirationDate,
      assignedEmplacementId,
      phone,
      service,
      photoEmbeddings: formattedPhotoEmbeddings, // <--- Use formatted string
      fingerprintEmbeddings: formattedFingerprintEmbeddings, // <--- Use formatted string
      isActive,
    });

    res.status(201).json(newPersonnel);
  } catch (error) {
    console.error('Error creating personnel:', error);
    if (error.message.includes('National ID already exists')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating personnel', error: error.message });
  }
};

exports.getAllPersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findAll();
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};

exports.getPersonnelById = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel by ID:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};

exports.getPersonnelByQrCode = async (req, res) => {
  try {
    const personnel = await Personnel.findByQrCode(req.params.qrCode);
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found with this QR Code' });
    }
    res.status(200).json(personnel);
  } catch (error) {
    console.error('Error fetching personnel by QR Code:', error);
    res.status(500).json({ message: 'Error fetching personnel', error: error.message });
  }
};

exports.updatePersonnel = async (req, res) => {
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

    const updatedPersonnel = await Personnel.update(req.params.id, updates);
    if (!updatedPersonnel) {
      return res.status(404).json({ message: 'Personnel not found or no fields to update' });
    }
    res.status(200).json(updatedPersonnel);
  } catch (error) {
    console.error('Error updating personnel:', error);
    if (error.message.includes('National ID already exists')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating personnel', error: error.message });
  }
};

exports.deletePersonnel = async (req, res) => {
  try {
    const deletedPersonnel = await Personnel.delete(req.params.id);
    if (!deletedPersonnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    res.status(200).json({ message: 'Personnel deleted successfully', deletedPersonnel });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({ message: 'Error deleting personnel', error: error.message });
  }
};