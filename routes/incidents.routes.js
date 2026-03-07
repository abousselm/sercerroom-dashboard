const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);

// GET /api/incidents
router.get('/', incidentsController.getAllIncidents);

// GET /api/incidents/unresolved
router.get('/unresolved', incidentsController.getUnresolvedIncidents);

// GET /api/incidents/stats
router.get('/stats', incidentsController.getStats);

// GET /api/incidents/room/:roomId
router.get('/room/:roomId', incidentsController.getIncidentsByRoom);

// POST /api/incidents
router.post('/', roleMiddleware('admin', 'responsable_site'), incidentsController.createIncident);

// PUT /api/incidents/:id/resolve
router.put('/:id/resolve', roleMiddleware('admin', 'responsable_site'), incidentsController.resolveIncident);

module.exports = router;