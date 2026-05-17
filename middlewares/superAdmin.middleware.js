const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isSuperAdmin) {
      return res.status(403).json({ 
        message: '❌ Accès refusé : seul le Super Admin peut effectuer cette action' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ 
      message: '❌ Erreur serveur', 
      error: error.message 
    });
  }
};
