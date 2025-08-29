const express = require('express');
const router = express.Router();
const guardKioskAssignmentController = require('../controllers/guardKioskAssignmentController');

router.post('/', guardKioskAssignmentController.createGuardKioskAssignment);
router.get('/', guardKioskAssignmentController.getAllGuardKioskAssignments);
router.get('/:id', guardKioskAssignmentController.getGuardKioskAssignmentById);
router.delete('/:id', guardKioskAssignmentController.deleteGuardKioskAssignment);

module.exports = router;