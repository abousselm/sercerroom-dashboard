const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes dashboard
router.get('/my-site', authMiddleware, dashboardController.getMySite);

module.exports = router;