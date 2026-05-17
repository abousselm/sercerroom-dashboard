const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const superAdminMiddleware = require('../middlewares/superAdmin.middleware');

// Toutes les routes nécessitent d'être connecté
router.use(authMiddleware);

// GET /api/users
router.get('/', roleMiddleware('admin', 'responsable_site'), usersController.getAllUsers);

// GET /api/users/:id
router.get('/:id', roleMiddleware('admin', 'responsable_site'), usersController.getUserById);

// POST /api/users
router.post('/', roleMiddleware('admin', 'responsable_site'), usersController.createUser);

// PUT /api/users/:id
router.put('/:id', roleMiddleware('admin', 'responsable_site'), usersController.updateUser);

// DELETE /api/users/:id - SEULEMENT pour Super Admin
router.delete('/:id', superAdminMiddleware, usersController.deleteUser);

module.exports = router;