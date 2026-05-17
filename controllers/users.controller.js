const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ Lister tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    let query = {};

    // Si l'utilisateur est responsable de site, filtrer par son site
    if (req.user.role === 'responsable_site') {
      const user = await User.findById(req.user.id).populate('site');
      if (user && user.site) {
        query.site = user.site._id;
      } else {
        return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
      }
    }

    const users = await User.find(query)
      .select('-password')
      .populate('site');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('site');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (req.user.role === 'responsable_site') {
      const requester = await User.findById(req.user.id).populate('site');
      if (!requester) {
        return res.status(403).json({ message: '❌ Accès refusé' });
      }
      if (!requester.site || !user.site || requester.site._id.toString() !== user.site._id.toString()) {
        return res.status(403).json({ message: '❌ Accès refusé : ce compte n\'appartient pas à votre site' });
      }
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, site, rfidCard } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    let assignedSite = site || null;
    let assignedRole = role;

    // Si l'utilisateur est responsable de site, restreindre les permissions
    if (req.user.role === 'responsable_site') {
      const requester = await User.findById(req.user.id).populate('site');
      if (!requester || !requester.site) {
        return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
      }

      // Le responsable de site ne peut créer que des techniciens
      if (assignedRole !== 'technicien') {
        return res.status(403).json({ message: '❌ Vous ne pouvez créer que des techniciens' });
      }

      // Forcer l'assignation au site du responsable
      assignedSite = requester.site._id;

      // Créer une demande d'approbation au lieu d'un utilisateur direct
      const existingRequest = await require('../models/UserApprovalRequest').findOne({ email });
      if (existingRequest) {
        return res.status(400).json({ message: 'Une demande existe déjà pour cet email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const UserApprovalRequest = require('../models/UserApprovalRequest');
      const newRequest = new UserApprovalRequest({
        name,
        email,
        phone: '',
        password: hashedPassword,
        role: assignedRole,
        site: assignedSite,
        status: 'pending'
      });

      await newRequest.save();
      return res.status(201).json({ 
        message: '✅ Demande d\'approbation envoyée au Super Admin. Le compte sera activé après validation.',
        request: newRequest
      });
    }

    // Pour les admins, création directe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      site: assignedSite,
      rfidCard: rfidCard || null,
      isActive: true
    });

    await user.save();
    res.status(201).json({ message: '✅ Utilisateur créé avec succès', user });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Modifier un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, site, rfidCard, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Si l'utilisateur est responsable de site, restreindre les permissions
    if (req.user.role === 'responsable_site') {
      const requester = await User.findById(req.user.id).populate('site');
      if (!requester || !requester.site) {
        return res.status(403).json({ message: '❌ Aucun site assigné à votre compte' });
      }

      // Vérifier que l'utilisateur à modifier appartient au même site
      if (!user.site || user.site.toString() !== requester.site._id.toString()) {
        return res.status(403).json({ message: '❌ Accès refusé : cet utilisateur n\'appartient pas à votre site' });
      }

      // Le responsable ne peut pas changer le rôle vers autre chose que technicien
      if (role && role !== 'technicien') {
        return res.status(403).json({ message: '❌ Vous ne pouvez assigner que le rôle technicien' });
      }

      // Le responsable ne peut pas changer le site
      if (site && site.toString() !== requester.site._id.toString()) {
        return res.status(403).json({ message: '❌ Vous ne pouvez pas changer le site de l\'utilisateur' });
      }
    }

    // Validation du site pour les responsables de site
    if (role === 'responsable_site' && !site) {
      return res.status(400).json({ message: 'Un site doit être assigné aux responsables de site' });
    }

    if (site) {
      const Site = require('../models/Site');
      const siteExists = await Site.findById(site);
      if (!siteExists) {
        return res.status(400).json({ message: 'Site introuvable' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (role) user.role = role;
    if (site) user.site = site;
    user.rfidCard = rfidCard || user.rfidCard;
    if (isActive !== undefined) user.isActive = isActive;

    // ✅ Gestion du mot de passe - seulement si fourni
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: '✅ Utilisateur modifié avec succès', user });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Supprimer un utilisateur (SEULEMENT pour Super Admin)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;

    // Empêcher la suppression de soi-même
    if (userId === currentUserId) {
      return res.status(400).json({ message: '❌ Vous ne pouvez pas vous supprimer vous-même' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Empêcher la suppression d'un autre Super Admin
    if (user.isSuperAdmin) {
      return res.status(403).json({ message: '❌ Vous ne pouvez pas supprimer un Super Admin' });
    }

    await user.deleteOne();
    res.status(200).json({ message: '✅ Utilisateur supprimé définitivement avec succès' });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};