const User = require('../models/User');
const UserApprovalRequest = require('../models/UserApprovalRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);

    const { name, email, password, phone, role } = req.body;

    // ✅ Validation stricte
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "❌ name, email et password sont obligatoires"
      });
    }

    // ✅ Vérifier demande existante
    const existingRequest = await UserApprovalRequest.findOne({ email });
    if (existingRequest) {
      return res.status(400).json({
        message: "❌ Une demande existe déjà pour cet email"
      });
    }

    // ✅ Vérifier utilisateur existant
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "❌ Email déjà utilisé"
      });
    }

    // ✅ Sécuriser bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Création demande
    const newRequest = new UserApprovalRequest({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: role || "technicien",
      status: "pending"
    });

    await newRequest.save();

    return res.status(201).json({
      message: "✅ Inscription envoyée, en attente d'approbation"
    });

  } catch (error) {
    console.log("❌ REGISTER ERROR:", error);

    return res.status(500).json({
      message: "❌ Erreur serveur",
      error: error.message
    });
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('site');
    if (!user) {
      return res.status(404).json({ message: "❌ Utilisateur introuvable" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// ================= GET PENDING APPROVALS =================
exports.getPendingApprovals = async (req, res) => {
  try {
    const requests = await UserApprovalRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// ================= APPROVE USER =================
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const request = await UserApprovalRequest.findById(userId);

    if (!request) {
      return res.status(404).json({ message: "❌ Demande introuvable" });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: "❌ La demande a déjà été traitée" });
    }

    const newUser = new User({
      name: request.name,
      email: request.email,
      phone: request.phone,
      password: request.password,
      role: request.role,
      site: request.site || null,
      isActive: true,
      approvedBy: req.user.id
    });

    await newUser.save();

    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = req.user.id;
    await request.save();

    return res.status(200).json({ message: "✅ Utilisateur approuvé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// ================= REJECT USER =================
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const request = await UserApprovalRequest.findById(userId);

    if (!request) {
      return res.status(404).json({ message: "❌ Demande introuvable" });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: "❌ La demande a déjà été traitée" });
    }

    request.status = 'rejected';
    request.rejectionReason = reason || null;
    await request.save();

    return res.status(200).json({ message: "❌ Demande rejetée" });
  } catch (error) {
    return res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "❌ email et password requis"
      });
    }

    const user = await User.findOne({ email }).populate('site');

    if (!user) {
      // Vérifier si une demande d'approbation est en attente
      const pendingRequest = await UserApprovalRequest.findOne({ email, status: 'pending' });
      if (pendingRequest) {
        return res.status(403).json({
          message: "❌ Compte en attente d'approbation par le Super Admin"
        });
      }
      return res.status(404).json({
        message: "❌ Utilisateur introuvable"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "❌ Compte non activé"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "❌ Mot de passe incorrect"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, site: user.site ? user.site._id : null },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "✅ Login réussi",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        site: user.site
      }
    });

  } catch (error) {
    console.log("❌ LOGIN ERROR:", error);

    return res.status(500).json({
      message: "❌ Erreur serveur",
      error: error.message
    });
  }
};
