const AccessLog = require('../models/AccessLog');
const Room = require('../models/Room');
const User = require('../models/User');

// ✅ Lister tous les logs d'accès
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find()
      .populate('user', '-password')
      .populate('room')
      .sort({ createdAt: -1 }); // plus récent en premier
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Lister les logs par salle
exports.getLogsByRoom = async (req, res) => {
  try {
    const logs = await AccessLog.find({ room: req.params.roomId })
      .populate('user', '-password')
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Vérifier accès RFID (appelé par ESP32)
exports.checkAccess = async (req, res) => {
  try {
    const { rfidCard, esp32Id } = req.body;

    // Trouver la salle associée à l'ESP32
    const room = await Room.findOne({ esp32Id });
    if (!room) {
      return res.status(404).json({ 
        access: false, 
        message: 'Salle introuvable' 
      });
    }

    // Trouver l'utilisateur par carte RFID
    const user = await User.findOne({ rfidCard, isActive: true });

    if (!user) {
      // Carte inconnue → accès refusé
      await AccessLog.create({
        user: null,
        room: room._id,
        rfidCard,
        accessGranted: false,
        reason: 'Carte RFID inconnue'
      });
      return res.status(200).json({ 
        access: false, 
        message: 'Carte RFID inconnue' 
      });
    }

    // Vérifier si l'utilisateur est autorisé dans cette salle
    const isAuthorized = room.authorizedUsers.includes(user._id.toString());

    if (!isAuthorized) {
      // Utilisateur non autorisé → accès refusé
      await AccessLog.create({
        user: user._id,
        room: room._id,
        rfidCard,
        accessGranted: false,
        reason: 'Utilisateur non autorisé dans cette salle'
      });
      return res.status(200).json({ 
        access: false, 
        message: 'Accès non autorisé' 
      });
    }

    // ✅ Accès autorisé
    await AccessLog.create({
      user: user._id,
      room: room._id,
      rfidCard,
      accessGranted: true,
      reason: null
    });

    return res.status(200).json({ 
      access: true, 
      message: `✅ Accès autorisé - Bienvenue ${user.name}`,
      user: {
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Statistiques des accès
exports.getStats = async (req, res) => {
  try {
    const totalAccess = await AccessLog.countDocuments();
    const authorizedAccess = await AccessLog.countDocuments({ accessGranted: true });
    const refusedAccess = await AccessLog.countDocuments({ accessGranted: false });

    res.status(200).json({
      totalAccess,
      authorizedAccess,
      refusedAccess
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};