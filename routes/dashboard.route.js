const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const Site = require('../models/Site');
const Room = require('../models/Room');

router.get('/my-site', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'responsable_site' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const site = await Site.findOne({ responsable: userId, isActive: true })
      .populate('responsable', 'name email');

    if (!site) {
      return res.status(404).json({ message: 'Aucun site assigné à ce responsable' });
    }

    const rooms = await Room.find({ site: site._id, isActive: true })
      .populate('authorizedUsers', 'name email role');

    const stats = {
      totalRooms: rooms.length,
    };

    res.json({ site, rooms, stats });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;