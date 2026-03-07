const express = require('express');
const router = express.Router();
const eolAlertController = require('../controllers/eolAlert.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);

// GET /api/eol-alerts
router.get('/', eolAlertController.getAllEolAlerts);

// GET /api/eol-alerts/unresolved
router.get('/unresolved', eolAlertController.getUnresolvedEolAlerts);

// GET /api/eol-alerts/stats
router.get('/stats', eolAlertController.getEolStats);

// PUT /api/eol-alerts/:id/resolve
router.put('/:id/resolve', roleMiddleware('admin', 'responsable_site'), eolAlertController.resolveEolAlert);

// POST /api/eol-alerts/:id/send-email
router.post('/:id/send-email', roleMiddleware('admin', 'responsable_site'), eolAlertController.sendEolAlertEmail);

module.exports = router;