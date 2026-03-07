const EolAlert = require('../models/EolAlert');
const sendAlertEmail = require('../utils/sendAlert');

// ✅ Lister toutes les alertes EOL
exports.getAllEolAlerts = async (req, res) => {
  try {
    const alerts = await EolAlert.find()
      .populate('equipment')
      .populate('room')
      .populate('site')
      .sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Lister alertes non résolues
exports.getUnresolvedEolAlerts = async (req, res) => {
  try {
    const alerts = await EolAlert.find({ resolved: false })
      .populate('equipment')
      .populate('room')
      .populate('site')
      .sort({ daysRemaining: 1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Résoudre une alerte EOL
exports.resolveEolAlert = async (req, res) => {
  try {
    const alert = await EolAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alerte introuvable' });
    }

    alert.resolved = true;
    await alert.save();

    res.status(200).json({ message: '✅ Alerte résolue avec succès', alert });
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Envoyer email pour une alerte EOL
exports.sendEolAlertEmail = async (req, res) => {
  try {
    const alert = await EolAlert.findById(req.params.id)
      .populate('equipment')
      .populate('room')
      .populate('site');

    if (!alert) {
      return res.status(404).json({ message: 'Alerte introuvable' });
    }

    await sendAlertEmail({
      to: process.env.EMAIL_USER,
      subject: `⚠️ Alerte EOL - ${alert.equipment.name}`,
      roomName: alert.room.name,
      type: 'Fin de vie équipement',
      severity: alert.severity,
      description: `L'équipement "${alert.equipment.name}" arrive en fin de vie dans ${alert.daysRemaining} jours (${new Date(alert.endOfLife).toLocaleDateString()})`
    });

    alert.emailSent = true;
    await alert.save();

    res.status(200).json({ message: '✅ Email envoyé avec succès' });
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

// ✅ Statistiques EOL
exports.getEolStats = async (req, res) => {
  try {
    const total = await EolAlert.countDocuments({ resolved: false });
    const critique = await EolAlert.countDocuments({ severity: 'critique', resolved: false });
    const warning = await EolAlert.countDocuments({ severity: 'warning', resolved: false });
    const info = await EolAlert.countDocuments({ severity: 'info', resolved: false });

    res.status(200).json({ total, critique, warning, info });
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};