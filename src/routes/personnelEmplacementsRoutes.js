const express = require('express');
const router = express.Router();
const controller = require('../controllers/personnelEmplacementsController');

// Get all PersonnelEmplacements
router.get('/', controller.getAll);

// Get by Personnel ID
router.get('/:personnelId', controller.getByPersonnelId);

// Add a new PersonnelEmplacement
router.post('/', controller.add);

// Delete a PersonnelEmplacement
router.delete('/', controller.remove);

// Update expiration date
router.put('/expiration', controller.updateExpiration);
router.get('/emplacements/:personnelId', controller.getEmplacementsByPersonnelId);
router.post('/bulk-update', controller.bulkUpdateAccess);
module.exports = router;
