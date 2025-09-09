const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');
const upload = require('../config/multerConfig'); // Import multer config
router.get('/pin/:pin', personnelController.getPersonnelByPin);
router.get('/qr/:qrCode', personnelController.getPersonnelByQrCode);
router.post('/', personnelController.createPersonnel);
router.get('/', personnelController.getAllPersonnel);
router.get('/:id', personnelController.getPersonnelById);
router.get('/qrcode/:qrCode', personnelController.getPersonnelByQrCode); // New route for QR code lookup
router.put('/:id', personnelController.updatePersonnel);
router.delete('/:id', personnelController.deletePersonnel);
 
router.post('/upload-image', upload.single('image'), personnelController.uploadImageWithEmbeddings);
router.post('/verify-image', upload.single('image'), personnelController.verifyImage);



router.get('/check-access', personnelController.checkAccess);

module.exports = router;