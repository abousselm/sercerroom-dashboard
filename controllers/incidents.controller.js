const Incident = require('../models/Incident');

// ✅ Lister tous les incidents
exports.getAllIncidents = async (req, res) => {
  try {
    let query = {};

    // Si l'utilisateur est responsable de site ou technicien, filtrer par son site
    if (req.user.role === 'responsable_site' || req.user.role === 'technicien') {
      const user = await require('../models/User').findById(req.user.id).populate('site');
      if (user && user.site) {
        // Trouver toutes les salles du site de l'utilisateur
        const Room = require('../models/Room');
        const rooms = await Room.find({ site: user.site._id });
        const roomIds = rooms.map(room => room._id);
        query.room = { $in: roomIds };
      } else {
        return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
      }
    }

    const incidents = await Incident.find(query)
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Lister incidents par salle
exports.getIncidentsByRoom = async (req, res) => {
  try {
    const incidents = await Incident.find({ room: req.params.roomId })
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Lister incidents non résolus
exports.getUnresolvedIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ resolved: false })
      .populate('room')
      .sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Créer un incident manuellement
exports.createIncident = async (req, res) => {
  try {
    const { room, type, severity, description } = req.body;

    const incident = new Incident({
      room: room || null,
      type,
      severity,
      description,
      resolved: false
    });

    await incident.save();
    res.status(201).json({ message: '✅ Incident créé avec succès', incident });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Résoudre un incident
exports.resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident introuvable' });
    }

    incident.resolved = true;
    incident.resolvedAt = new Date();
    await incident.save();

    res.status(200).json({ message: '✅ Incident résolu avec succès', incident });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Statistiques des incidents
exports.getStats = async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const resolved = await Incident.countDocuments({ resolved: true });
    const unresolved = await Incident.countDocuments({ resolved: false });
    const critique = await Incident.countDocuments({ severity: 'critique', resolved: false });

    res.status(200).json({ total, resolved, unresolved, critique });
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};