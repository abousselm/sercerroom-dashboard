const User = require('../models/User');
const Site = require('../models/Site'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, site } = req.body;

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
      site: site || null
    });

    await user.save();

    res.status(201).json({ message: '✅ Utilisateur créé avec succès' });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('site');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: '✅ Connexion réussie',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        site: user.site
      }
    });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Get Me (profil)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('site');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};