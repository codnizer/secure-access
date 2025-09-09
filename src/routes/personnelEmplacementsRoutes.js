// routes/personnelEmplacementsRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/personnelEmplacementsController');

// ✅ STATIC ROUTES FIRST - Define ALL static routes before parameterized ones
router.get('/', controller.getAll);
router.post('/', controller.add);
router.delete('/', controller.remove);
router.put('/expiration', controller.updateExpiration);
router.post('/bulk-update', controller.bulkUpdateAccess);
router.get('/check-access', controller.checkAccess); // ← ADD THIS STATIC ROUTE
router.get('/emplacements/:personnelId', controller.getEmplacementsByPersonnelId);

// ✅ PARAMETERIZED ROUTES LAST - Define these AFTER all static routes
router.get('/:personnelId', controller.getByPersonnelId); // ← MOVE THIS TO THE END

module.exports = router;
