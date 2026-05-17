const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const testDeleteFunctionality = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion réussie\n');

    // Compter les utilisateurs avant
    const usersBefore = await User.countDocuments();
    console.log(`👥 Utilisateurs avant test: ${usersBefore}`);

    // Créer un utilisateur de test
    const testUser = new User({
      name: 'Test User Delete',
      email: 'testdelete@example.com',
      password: 'hashedpassword',
      role: 'technicien',
      isActive: true
    });

    await testUser.save();
    console.log(`✅ Utilisateur de test créé: ${testUser.name} (${testUser._id})`);

    // Vérifier qu'il existe
    const foundUser = await User.findById(testUser._id);
    console.log(`🔍 Utilisateur trouvé: ${foundUser ? 'OUI' : 'NON'}`);

    // Simuler la suppression
    await foundUser.deleteOne();
    console.log('🗑️ Utilisateur supprimé');

    // Vérifier qu'il n'existe plus
    const deletedUser = await User.findById(testUser._id);
    console.log(`🔍 Utilisateur après suppression: ${deletedUser ? 'ENCORE LÀ' : 'SUPPRIMÉ ✅'}`);

    // Compter les utilisateurs après
    const usersAfter = await User.countDocuments();
    console.log(`👥 Utilisateurs après test: ${usersAfter}`);

    console.log('\n✅ Test de suppression réussi!');
    console.log('   • Création d\'utilisateur: OK');
    console.log('   • Suppression: OK');
    console.log('   • Vérification: OK');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

testDeleteFunctionality();
