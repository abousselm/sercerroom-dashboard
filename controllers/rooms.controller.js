const Room = require('../models/Room');
const Site = require('../models/Site');

// ✅ Lister toutes les salles
exports.getAllRooms = async (req, res) => {
  try {
    let query = {};

    // Si l'utilisateur est responsable de site ou technicien, filtrer par son site
    if (req.user.role === 'responsable_site' || req.user.role === 'technicien') {
      const user = await require('../models/User').findById(req.user.id).populate('site');
      if (user && user.site) {
        query.site = user.site._id;
      } else {
        return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
      }
    }

    const rooms = await Room.find(query)
      .populate('site')
      .populate('authorizedUsers', '-password');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Obtenir une salle par ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('site')
      .populate('authorizedUsers', '-password');
    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Créer une salle
exports.createRoom = async (req, res) => {
  try {
    const { name, site, esp32Id, authorizedUsers } = req.body;

    const siteExists = await Site.findById(site);
    if (!siteExists) {
      return res.status(404).json({ message: 'Site introuvable' });
    }

    const room = new Room({
      name,
      site,
      esp32Id: esp32Id || null,
      authorizedUsers: authorizedUsers || []
    });

    await room.save();
    res.status(201).json({ message: '✅ Salle créée avec succès', room });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Modifier une salle
exports.updateRoom = async (req, res) => {
  try {
    const { name, esp32Id, authorizedUsers, isActive } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }

    room.name = name || room.name;
    room.esp32Id = esp32Id || room.esp32Id;
    room.authorizedUsers = authorizedUsers || room.authorizedUsers;
    if (isActive !== undefined) room.isActive = isActive;

    await room.save();
    res.status(200).json({ message: '✅ Salle modifiée avec succès', room });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Ajouter un utilisateur autorisé
exports.addAuthorizedUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }

    if (room.authorizedUsers.includes(userId)) {
      return res.status(400).json({ message: 'Utilisateur déjà autorisé' });
    }

    room.authorizedUsers.push(userId);
    await room.save();

    res.status(200).json({ message: '✅ Utilisateur ajouté avec succès', room });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Retirer un utilisateur autorisé
exports.removeAuthorizedUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }

    room.authorizedUsers = room.authorizedUsers.filter(
      u => u.toString() !== userId
    );
    await room.save();

    res.status(200).json({ message: '✅ Utilisateur retiré avec succès', room });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};