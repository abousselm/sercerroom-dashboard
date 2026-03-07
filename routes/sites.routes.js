const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sites.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);

// GET /api/sites
router.get('/', sitesController.getAllSites);

// GET /api/sites/:id
router.get('/:id', sitesController.getSiteById);

// POST /api/sites
router.post('/', roleMiddleware('admin'), sitesController.createSite);

// PUT /api/sites/:id
router.put('/:id', roleMiddleware('admin'), sitesController.updateSite);

module.exports = router;