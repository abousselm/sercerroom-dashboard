const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const setSuperAdmin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion réussie\n');

    // Trouver l'administrateur principal (Super Admin)
    const superAdmin = await User.findOne({ role: 'admin' });
    
    if (!superAdmin) {
      console.log('❌ Aucun administrateur trouvé dans la base de données');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Marquer l'admin comme super admin
    superAdmin.isSuperAdmin = true;
    await superAdmin.save();

    console.log(`✅ Super Admin configuré avec succès:`);
    console.log(`   • Nom: ${superAdmin.name}`);
    console.log(`   • Email: ${superAdmin.email}`);
    console.log(`   • Permission d'approbation: ✓ OUI`);

    // Afficher les autres admins (s'il y en a)
    const otherAdmins = await User.find({ role: 'admin', _id: { $ne: superAdmin._id } });
    if (otherAdmins.length > 0) {
      console.log(`\n⚠️  ${otherAdmins.length} autre(s) admin(s) trouvé(s):`);
      otherAdmins.forEach(admin => {
        console.log(`   • ${admin.name} (${admin.email}) - Super Admin: ${admin.isSuperAdmin ? 'OUI' : 'NON'}`);
      });
    }

    console.log('\n🔐 Configuration de sécurité:');
    console.log('   • Seul le Super Admin peut approuver les comptes');
    console.log('   • Seul le Super Admin voit l\'onglet "Approbations"');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

setSuperAdmin();
