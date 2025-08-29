const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');

router.post('/', personnelController.createPersonnel);
router.get('/', personnelController.getAllPersonnel);
router.get('/:id', personnelController.getPersonnelById);
router.get('/qrcode/:qrCode', personnelController.getPersonnelByQrCode); // New route for QR code lookup
router.put('/:id', personnelController.updatePersonnel);
router.delete('/:id', personnelController.deletePersonnel);

module.exports = router;