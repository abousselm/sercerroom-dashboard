const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);

// GET /api/equipments
router.get('/', equipmentController.getAllEquipments);

// GET /api/equipments/near-eol
router.get('/near-eol', equipmentController.getEquipmentsNearEol);

// GET /api/equipments/room/:roomId
router.get('/room/:roomId', equipmentController.getEquipmentsByRoom);

// GET /api/equipments/:id
router.get('/:id', equipmentController.getEquipmentById);

// POST /api/equipments
router.post('/', roleMiddleware('admin', 'responsable_site'), equipmentController.createEquipment);

// PUT /api/equipments/:id
router.put('/:id', roleMiddleware('admin', 'responsable_site'), equipmentController.updateEquipment);

module.exports = router;