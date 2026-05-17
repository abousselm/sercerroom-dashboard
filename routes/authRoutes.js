const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const superAdminMiddleware = require('../middlewares/superAdmin.middleware');

// AUTH
router.post('/register', authController.register);
router.post('/login', authController.login);

// USER
router.get('/me', authMiddleware, authController.getMe);

// ADMIN
router.get('/pending-approvals', authMiddleware, superAdminMiddleware, authController.getPendingApprovals);

router.post('/approve/:userId', authMiddleware, superAdminMiddleware, authController.approveUser);

router.post('/reject/:userId', authMiddleware, superAdminMiddleware, authController.rejectUser);

module.exports = router;