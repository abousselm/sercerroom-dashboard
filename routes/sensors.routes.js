const express = require('express');
const router = express.Router();
const sensorsController = require('../controllers/sensors.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ⚠️ Route appelée par ESP32 sans token
router.post('/data', sensorsController.receiveSensorData);

// Routes protégées
router.use(authMiddleware);

// GET /api/sensors/latest
router.get('/latest', sensorsController.getAllLatest);

// GET /api/sensors/room/:roomId/latest
router.get('/room/:roomId/latest', sensorsController.getLatestByRoom);

// GET /api/sensors/room/:roomId/history
router.get('/room/:roomId/history', sensorsController.getHistoryByRoom);

module.exports = router;