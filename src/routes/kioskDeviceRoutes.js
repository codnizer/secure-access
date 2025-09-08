const express = require('express');
const router = express.Router();
const kioskDeviceController = require('../controllers/kioskDeviceController');

router.post('/', kioskDeviceController.createKioskDevice);
router.get('/', kioskDeviceController.getAllKioskDevices);
router.get('/:id', kioskDeviceController.getKioskDeviceById);
router.put('/:id', kioskDeviceController.updateKioskDevice);
router.delete('/:id', kioskDeviceController.deleteKioskDevice);
// Route for updating only the online status
router.put('/:id/online', kioskDeviceController.updateOnlineStatus);
module.exports = router;