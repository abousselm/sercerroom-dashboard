const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Toutes les routes nécessitent d'être connecté
router.use(authMiddleware);

// GET /api/users
router.get('/', roleMiddleware('admin'), usersController.getAllUsers);

// GET /api/users/:id
router.get('/:id', roleMiddleware('admin', 'responsable_site'), usersController.getUserById);

// POST /api/users
router.post('/', roleMiddleware('admin'), usersController.createUser);

// PUT /api/users/:id
router.put('/:id', roleMiddleware('admin'), usersController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', roleMiddleware('admin'), usersController.deleteUser);

module.exports = router;