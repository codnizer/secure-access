const Emplacement = require('../models/emplacementModel');

exports.createEmplacement = async (req, res) => {
  try {
    const newEmplacement = await Emplacement.create(req.body);
    res.status(201).json(newEmplacement);
  } catch (error) {
    console.error('Error creating emplacement:', error);
    res.status(500).json({ message: 'Error creating emplacement', error: error.message });
  }
};

exports.getAllEmplacements = async (req, res) => {
  try {
    const emplacements = await Emplacement.findAll();
    res.status(200).json(emplacements);
  } catch (error) {
    console.error('Error fetching emplacements:', error);
    res.status(500).json({ message: 'Error fetching emplacements', error: error.message });
  }
};

exports.getEmplacementById = async (req, res) => {
  try {
    const emplacement = await Emplacement.findById(req.params.id);
    if (!emplacement) {
      return res.status(404).json({ message: 'Emplacement not found' });
    }
    res.status(200).json(emplacement);
  } catch (error) {
    console.error('Error fetching emplacement by ID:', error);
    res.status(500).json({ message: 'Error fetching emplacement', error: error.message });
  }
};

exports.updateEmplacement = async (req, res) => {
  try {
    const updatedEmplacement = await Emplacement.update(req.params.id, req.body);
    if (!updatedEmplacement) {
      return res.status(404).json({ message: 'Emplacement not found' });
    }
    res.status(200).json(updatedEmplacement);
  } catch (error) {
    console.error('Error updating emplacement:', error);
    res.status(500).json({ message: 'Error updating emplacement', error: error.message });
  }
};

exports.deleteEmplacement = async (req, res) => {
  try {
    const deletedEmplacement = await Emplacement.delete(req.params.id);
    if (!deletedEmplacement) {
      return res.status(404).json({ message: 'Emplacement not found' });
    }
    res.status(200).json({ message: 'Emplacement deleted successfully', deletedEmplacement });
  } catch (error) {
    console.error('Error deleting emplacement:', error);
    res.status(500).json({ message: 'Error deleting emplacement', error: error.message });
  }
};