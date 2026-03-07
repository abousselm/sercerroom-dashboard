const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ Lister tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      site: site || null,
      rfidCard: rfidCard || null
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
    const { name, email, role, site, rfidCard, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.site = site || user.site;
    user.rfidCard = rfidCard || user.rfidCard;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.status(200).json({ message: '✅ Utilisateur modifié avec succès', user });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    await user.deleteOne();
    res.status(200).json({ message: '✅ Utilisateur supprimé avec succès' });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};