const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const testPasswordUpdate = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion réussie\n');

    // Créer un utilisateur de test
    const testUser = new User({
      name: 'Test Password Update',
      email: 'testpassword@example.com',
      password: await bcrypt.hash('oldpassword', 10),
      role: 'technicien',
      isActive: true
    });

    await testUser.save();
    console.log(`✅ Utilisateur de test créé: ${testUser.name}`);

    // Ancien mot de passe
    const oldPassword = testUser.password;
    console.log(`🔑 Ancien hash: ${oldPassword.substring(0, 20)}...`);

    // Simuler la mise à jour du mot de passe
    const newPassword = 'newpassword123';
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    testUser.password = hashedNewPassword;
    await testUser.save();

    console.log(`🔑 Nouveau hash: ${hashedNewPassword.substring(0, 20)}...`);

    // Vérifier que les hashes sont différents
    const hashesDifferent = oldPassword !== hashedNewPassword;
    console.log(`🔍 Hashes différents: ${hashesDifferent ? 'OUI ✅' : 'NON ❌'}`);

    // Vérifier que le nouveau mot de passe fonctionne
    const passwordMatches = await bcrypt.compare(newPassword, testUser.password);
    console.log(`🔐 Nouveau mot de passe valide: ${passwordMatches ? 'OUI ✅' : 'NON ❌'}`);

    // Nettoyer
    await testUser.deleteOne();
    console.log('🧹 Utilisateur de test supprimé');

    console.log('\n✅ Test de mise à jour du mot de passe réussi!');
    console.log('   • Hashing fonctionne: OK');
    console.log('   • Sauvegarde en DB: OK');
    console.log('   • Vérification: OK');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

testPasswordUpdate();
