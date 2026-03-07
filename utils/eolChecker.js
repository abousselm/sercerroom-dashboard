const Equipment = require('../models/Equipment');
const EolAlert = require('../models/EolAlert');
const sendAlertEmail = require('./sendAlert');

const checkEndOfLife = async () => {
  try {
    const today = new Date();

    const equipments = await Equipment.find({ 
      endOfLife: { $ne: null }, 
      status: 'actif' 
    }).populate('room site');

    for (const eq of equipments) {
      const daysRemaining = Math.ceil(
        (new Date(eq.endOfLife) - today) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining > 90 || daysRemaining < 0) continue;

      let severity = 'info';
      if (daysRemaining <= 30) severity = 'critique';
      else if (daysRemaining <= 90) severity = 'warning';

      const existingAlert = await EolAlert.findOne({ 
        equipment: eq._id, 
        resolved: false 
      });

      if (!existingAlert) {
        const alert = await EolAlert.create({
          equipment: eq._id,
          room: eq.room._id,
          site: eq.site._id,
          endOfLife: eq.endOfLife,
          daysRemaining,
          severity,
          emailSent: false,
          resolved: false
        });

        console.log(`⚠️ Alerte EOL créée pour : ${eq.name} (${daysRemaining} jours restants)`);

        // Envoyer email si critique ou warning
        if (severity === 'critique' || severity === 'warning') {
          console.log(`📧 Envoi email EOL pour : ${eq.name}`);
          try {
            await sendAlertEmail({
              to: process.env.EMAIL_USER,
              subject: `⚠️ Alerte EOL - ${eq.name} expire dans ${daysRemaining} jours`,
              roomName: eq.room.name,
              type: 'Fin de vie équipement',
              severity,
              description: `L'équipement "${eq.name}" (${eq.type}) arrive en fin de vie dans ${daysRemaining} jours - Date EOL : ${new Date(eq.endOfLife).toLocaleDateString()}`
            });
            alert.emailSent = true;
            await alert.save();
            console.log(`✅ Email EOL envoyé pour : ${eq.name}`);
          } catch (emailError) {
            console.error(`❌ Erreur email EOL :`, emailError.message);
          }
        }

      } else {
        existingAlert.daysRemaining = daysRemaining;
        existingAlert.severity = severity;
        await existingAlert.save();
      }
    }

  } catch (error) {
    console.error('❌ Erreur EOL checker :', error.message);
  }
};

module.exports = checkEndOfLife;