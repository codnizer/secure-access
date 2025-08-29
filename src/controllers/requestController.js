const Request = require('../models/requestModel');
const Personnel = require('../models/personnelModel');
const Emplacement = require('../models/emplacementModel');

exports.createRequest = async (req, res) => {
  try {
    const { type, personnelId, emplacementId, method, success } = req.body;

    if (!['access', 'exit'].includes(type)) {
      return res.status(400).json({ message: 'Invalid request type. Must be "access" or "exit".' });
    }
    if (!personnelId || !emplacementId || method === undefined || success === undefined) {
      return res.status(400).json({ message: 'Missing required fields: personnelId, emplacementId, method, success' });
    }

    // Validate FKs
    const personnelExists = await Personnel.findById(personnelId);
    if (!personnelExists) {
      return res.status(400).json({ message: 'Invalid personnelId: Personnel does not exist' });
    }
    const emplacementExists = await Emplacement.findById(emplacementId);
    if (!emplacementExists) {
      return res.status(400).json({ message: 'Invalid emplacementId: Emplacement does not exist' });
    }

    const newRequest = await Request.create({ type, personnelId, emplacementId, method, success });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.findAll();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching request by ID:', error);
    res.status(500).json({ message: 'Error fetching request', error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { type, personnelId, emplacementId, ...updates } = req.body;

    // Optional: Re-validate type, personnelId, emplacementId if they are part of updates
    if (type && !['access', 'exit'].includes(type)) {
      return res.status(400).json({ message: 'Invalid request type. Must be "access" or "exit".' });
    }
    if (personnelId) {
      const personnelExists = await Personnel.findById(personnelId);
      if (!personnelExists) return res.status(400).json({ message: 'Invalid personnelId' });
    }
    if (emplacementId) {
      const emplacementExists = await Emplacement.findById(emplacementId);
      if (!emplacementExists) return res.status(400).json({ message: 'Invalid emplacementId' });
    }

    const updatedRequest = await Request.update(req.params.id, req.body);
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found or no fields to update' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request', error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const deletedRequest = await Request.delete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully', deletedRequest });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
};