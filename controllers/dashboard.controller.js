const User = require('../models/User');
const Site = require('../models/Site');

// ✅ Récupérer les informations du site de l'utilisateur responsable_site
exports.getMySite = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'responsable_site') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const site = await Site.findById(user.site);
    if (!site) {
      return res.status(404).json({ message: 'Site introuvable' });
    }

    res.status(200).json({ site });
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};