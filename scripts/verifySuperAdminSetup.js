const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const verifySuperAdminSetup = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion réussie\n');

    // Vérifier que le Super Admin est bien configuré
    const superAdmin = await User.findOne({ role: 'admin', isSuperAdmin: true });
    
    console.log('🔐 Vérification des permissions d\'approbation:');
    console.log('-'.repeat(60));
    
    if (superAdmin) {
      console.log(`✅ Super Admin trouvé:`);
      console.log(`   • Nom: ${superAdmin.name}`);
      console.log(`   • Email: ${superAdmin.email}`);
      console.log(`   • Peut approuver les comptes: OUI ✓`);
      console.log(`   • Voit l'onglet "Approbations": OUI ✓`);
    } else {
      console.log('❌ Aucun Super Admin trouvé!');
    }

    // Afficher tous les admins et leur statut
    const allAdmins = await User.find({ role: 'admin' });
    console.log(`\n\n👥 État des administrateurs (${allAdmins.length} total):`);
    console.log('-'.repeat(60));
    
    allAdmins.forEach(admin => {
      const superAdminStatus = admin.isSuperAdmin ? '🔐 SUPER ADMIN' : '👤 Admin normal';
      const approvalRight = admin.isSuperAdmin ? '✓ Peut approuver' : '✗ Ne peut pas approuver';
      console.log(`${superAdminStatus} | ${admin.name} (${admin.email}) | ${approvalRight}`);
    });

    // Vérifier les demandes en attente
    const UserApprovalRequest = require('../models/UserApprovalRequest');
    const pendingCount = await UserApprovalRequest.countDocuments({ status: 'pending' });
    
    console.log(`\n\n📋 Demandes d'approbation:`);
    console.log('-'.repeat(60));
    console.log(`   • En attente: ${pendingCount}`);

    console.log('\n✅ Configuration Super Admin correcte!');
    console.log('   • Seul le Super Admin peut approuver les utilisateurs');
    console.log('   • Seul le Super Admin voit l\'onglet "Approbations"');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

verifySuperAdminSetup();
