const Site = require('../models/Site');
const User = require('../models/User');

// ✅ Lister tous les sites
exports.getAllSites = async (req, res) => {
  try {
    let query = {};

    // Si l'utilisateur est responsable de site ou technicien, filtrer par son site
    if (req.user.role === 'responsable_site' || req.user.role === 'technicien') {
      const user = await User.findById(req.user.id);

      // Responsable de site: chercher le site via champ `responsable` (legacy)
      if (req.user.role === 'responsable_site') {
        const assignedSite = await Site.findOne({ responsable: user._id });
        if (assignedSite) {
          query._id = assignedSite._id;
        } else if (user.site) {
          query._id = user.site;
        } else {
          return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
        }
      } else {
        // Technicien: filtrer strictement par `user.site`
        if (user && user.site) {
          query._id = user.site;
        } else {
          return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
        }
      }
    }

    const sites = await Site.find(query).populate('responsable', '-password');
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

    // Responsable de site ou technicien: vérifier que c'est son site
    if (req.user.role === 'responsable_site' || req.user.role === 'technicien') {
      const user = await User.findById(req.user.id);
      const isAssignedViaResponsable = site.responsable && site.responsable._id.toString() === user._id.toString();
      const isAssignedViaUserSite = user.site && user.site.toString() === site._id.toString();
      if (!isAssignedViaResponsable && !isAssignedViaUserSite) {
        return res.status(403).json({ message: '❌ Accès refusé : ce site ne vous appartient pas' });
      }
    }

    res.status(200).json(site);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Créer un site
exports.createSite = async (req, res) => {
  try {
    // Seul l'admin/superadmin peut créer un site
    if (req.user.role === 'responsable_site') {
      return res.status(403).json({ message: '❌ Seul un administrateur peut créer un site' });
    }

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

    // Si responsable de site, vérifier que c'est son site
    if (req.user.role === 'responsable_site') {
      const user = await User.findById(req.user.id);
      const isAssignedViaResponsable = site.responsable && site.responsable.toString() === user._id.toString();
      const isAssignedViaUserSite = user.site && user.site.toString() === site._id.toString();
      if (!isAssignedViaResponsable && !isAssignedViaUserSite) {
        return res.status(403).json({ message: '❌ Accès refusé : vous ne pouvez modifier que votre site' });
      }
      // Le responsable ne peut pas changer le responsable du site
      if (responsable !== undefined) {
        return res.status(403).json({ message: '❌ Vous ne pouvez pas changer le responsable du site' });
      }
    }

    site.name = name || site.name;
    site.location = location || site.location;
    if (responsable !== undefined) site.responsable = responsable || site.responsable;
    if (isActive !== undefined) site.isActive = isActive;

    await site.save();
    res.status(200).json({ message: '✅ Site modifié avec succès', site });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};
