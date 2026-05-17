const Equipment = require('../models/Equipment');
const Room = require('../models/Room');
const Site = require('../models/Site');

// ✅ Lister tous les équipements
exports.getAllEquipments = async (req, res) => {
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

    const equipments = await Equipment.find(query)
      .populate('room')
      .populate('site')
      .populate('responsible', '-password');
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Lister les équipements par salle
exports.getEquipmentsByRoom = async (req, res) => {
  try {
    const equipments = await Equipment.find({ room: req.params.roomId })
      .populate('room')
      .populate('site')
      .populate('responsible', '-password');
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Obtenir un équipement par ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('room')
      .populate('site')
      .populate('responsible', '-password');
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement introuvable' });
    }
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Créer un équipement
exports.createEquipment = async (req, res) => {
  try {
    const { name, type, room, site, serialNumber, installDate, endOfLife, responsible, notes } = req.body;

    // Vérifier que la salle existe
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }

    // Vérifier que le site existe
    const siteExists = await Site.findById(site);
    if (!siteExists) {
      return res.status(404).json({ message: 'Site introuvable' });
    }

    const equipment = new Equipment({
      name,
      type,
      room,
      site,
      serialNumber: serialNumber || null,
      installDate: installDate || null,
      endOfLife: endOfLife || null,
      responsible: responsible || null,
      notes: notes || null
    });

    await equipment.save();
    res.status(201).json({ message: '✅ Équipement créé avec succès', equipment });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Modifier un équipement
exports.updateEquipment = async (req, res) => {
  try {
    const { name, type, serialNumber, installDate, endOfLife, status, responsible, notes } = req.body;

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement introuvable' });
    }

    equipment.name = name || equipment.name;
    equipment.type = type || equipment.type;
    equipment.serialNumber = serialNumber || equipment.serialNumber;
    equipment.installDate = installDate || equipment.installDate;
    equipment.endOfLife = endOfLife || equipment.endOfLife;
    equipment.status = status || equipment.status;
    equipment.responsible = responsible || equipment.responsible;
    equipment.notes = notes || equipment.notes;

    await equipment.save();
    res.status(200).json({ message: '✅ Équipement modifié avec succès', equipment });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Lister les équipements proches de EOL
exports.getEquipmentsNearEol = async (req, res) => {
  try {
    const today = new Date();
    const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const equipments = await Equipment.find({
      endOfLife: { $ne: null, $lte: in90Days },
      status: 'actif'
    })
      .populate('room')
      .populate('site')
      .sort({ endOfLife: 1 });

    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};