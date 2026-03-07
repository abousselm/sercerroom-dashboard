const Site = require('../models/Site');

// ✅ Lister tous les sites
exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.find().populate('responsable', '-password');
    res.status(200).json(sites);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Obtenir un site par ID
exports.getSiteById = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id).populate('responsable', '-password');
    if (!site) {
      return res.status(404).json({ message: 'Site introuvable' });
    }
    res.status(200).json(site);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Créer un site
exports.createSite = async (req, res) => {
  try {
    const { name, location, responsable } = req.body;

    const site = new Site({
      name,
      location,
      responsable: responsable || null
    });

    await site.save();
    res.status(201).json({ message: '✅ Site créé avec succès', site });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Modifier un site
exports.updateSite = async (req, res) => {
  try {
    const { name, location, responsable, isActive } = req.body;

    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site introuvable' });
    }

    site.name = name || site.name;
    site.location = location || site.location;
    site.responsable = responsable || site.responsable;
    if (isActive !== undefined) site.isActive = isActive;

    await site.save();
    res.status(200).json({ message: '✅ Site modifié avec succès', site });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};