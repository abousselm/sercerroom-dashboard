const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/rooms.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);

// GET /api/rooms
router.get('/', roomsController.getAllRooms);

// GET /api/rooms/:id
router.get('/:id', roomsController.getRoomById);

// POST /api/rooms
router.post('/', roleMiddleware('admin', 'responsable_site'), roomsController.createRoom);

// PUT /api/rooms/:id
router.put('/:id', roleMiddleware('admin', 'responsable_site'), roomsController.updateRoom);

// POST /api/rooms/:id/add-user
router.post('/:id/add-user', roleMiddleware('admin', 'responsable_site'), roomsController.addAuthorizedUser);

// POST /api/rooms/:id/remove-user
router.post('/:id/remove-user', roleMiddleware('admin', 'responsable_site'), roomsController.removeAuthorizedUser);

module.exports = router;