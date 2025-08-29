const express = require('express');
const router = express.Router();
const guardController = require('../controllers/guardController');

router.post('/', guardController.createGuard);
router.get('/', guardController.getAllGuards);
router.get('/:id', guardController.getGuardById);
router.put('/:id', guardController.updateGuard);
router.delete('/:id', guardController.deleteGuard);

module.exports = router;