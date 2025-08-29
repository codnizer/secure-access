const Log = require('../models/logModel');
const Personnel = require('../models/personnelModel');
const Emplacement = require('../models/emplacementModel');

exports.createLog = async (req, res) => {
  try {
    const { type, personnelId, emplacementId, method, success } = req.body;

    if (!['access', 'exit'].includes(type)) {
      return res.status(400).json({ message: 'Invalid log type. Must be "access" or "exit".' });
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

    const newLog = await Log.create({ type, personnelId, emplacementId, method, success });
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating log:', error);
    if (error.message.includes('Log entry with this hash already exists')) {
        return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating log', error: error.message });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.findAll();
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

exports.getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching log by ID:', error);
    res.status(500).json({ message: 'Error fetching log', error: error.message });
  }
};

exports.getLogByHash = async (req, res) => {
  try {
    const log = await Log.findByHash(req.params.hash);
    if (!log) {
      return res.status(404).json({ message: 'Log not found with this hash' });
    }
    res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching log by hash:', error);
    res.status(500).json({ message: 'Error fetching log', error: error.message });
  }
};

// No update/delete for logs to maintain immutability.