const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Mettre à jour tous les utilisateurs existants (qui n'ont pas de status) à "approved"
    const result = await User.updateMany(
      { status: { $exists: false } },
      { status: 'approved' }
    );

    console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour avec le statut 'approved'`);

    // Aussi approuver ceux qui sont en "pending" et existaient avant (optionnel)
    // Si vous voulez garder seulement les nouveaux en pending, ce code est bon
    
    await mongoose.connection.close();
    console.log('✅ Déconnexion de MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

db();
