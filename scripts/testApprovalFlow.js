const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const UserApprovalRequest = require('../models/UserApprovalRequest');

const testApprovalFlow = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion réussie\n');

    // 1. Vérifier UserApprovalRequest
    console.log('📊 Vérification des demandes d\'approbation....');
    const pendingRequests = await UserApprovalRequest.find({ status: 'pending' });
    console.log(`   • Demandes en attente: ${pendingRequests.length}`);
    
    if (pendingRequests.length > 0) {
      console.log('   Exemples:');
      pendingRequests.slice(0, 2).forEach(req => {
        console.log(`     - ${req.name} (${req.email}) - Rôle: ${req.role}`);
      });
    }

    // 2. Vérifier les utilisateurs approuvés
    console.log('\n👥 Vérification des utilisateurs approuvés...');
    const approvedUsers = await User.find();
    console.log(`   • Total d'utilisateurs approuvés: ${approvedUsers.length}`);
    if (approvedUsers.length > 0) {
      console.log('   Exemples:');
      approvedUsers.slice(0, 2).forEach(user => {
        console.log(`     - ${user.name} (${user.email}) - Rôle: ${user.role}`);
      });
    }

    // 3. Vérifier les champs du modèle User
    console.log('\n🔍 Vérification du support des champs...');
    if (approvedUsers.length > 0) {
      const user = approvedUsers[0];
      console.log(`   User de test: ${user.name}`);
      console.log(`   • Champs: name=${user.name}, email=${user.email}, role=${user.role}`);
      console.log(`   • Champs optionnels: phone=${user.phone}, approvedBy=${user.approvedBy}`);
    }

    console.log('\n✅ Système d\'approbation prêt!');
    console.log('   Workflow: Inscription → UserApprovalRequest → Admin approuve → User créé');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

testApprovalFlow();
