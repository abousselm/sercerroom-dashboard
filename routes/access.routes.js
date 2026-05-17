const express = require('express');
const router = express.Router();
const accessController = require('../controllers/access.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ⚠️ Cette route est appelée par l'ESP32 sans token
router.post('/check', accessController.checkAccess);

// Routes protégées
router.use(authMiddleware);

// GET /api/access
router.get('/', roleMiddleware('admin', 'responsable_site', 'technicien'), accessController.getAllLogs);

// GET /api/access/stats
router.get('/stats', roleMiddleware('admin', 'responsable_site', 'technicien'), accessController.getStats);

// GET /api/access/room/:roomId
router.get('/room/:roomId', roleMiddleware('admin', 'responsable_site', 'technicien'), accessController.getLogsByRoom);


module.exports = router;