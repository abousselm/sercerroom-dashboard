const SensorData = require('../models/SensorData');
const Room = require('../models/Room');
const Incident = require('../models/Incident');
const sendAlertEmail = require('../utils/sendAlert');

const THRESHOLDS = {
  temperature: 35,
  humidity: 80,
};

exports.receiveSensorData = async (req, res) => {
  try {
    const { esp32Id, temperature, humidity, smoke, doorOpen, powerCut } = req.body;

    const room = await Room.findOne({ esp32Id });
    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }

    const sensorData = new SensorData({
      room: room._id,
      esp32Id,
      temperature,
      humidity,
      smoke,
      doorOpen,
      powerCut
    });

    await sensorData.save();

    if (temperature > THRESHOLDS.temperature) {
      const incident = await Incident.create({
        room: room._id,
        type: 'temperature',
        severity: temperature > 45 ? 'critique' : 'moyen',
        description: `Température élevée détectée : ${temperature}°C (seuil : ${THRESHOLDS.temperature}°C)`,
        resolved: false
      });

      if (incident.severity === 'critique') {
        console.log('🌡️ Température critique - envoi email...');
        try {
          await sendAlertEmail({
            to: process.env.EMAIL_USER,
            subject: '🚨 Alerte Critique - Température élevée',
            roomName: room.name,
            type: 'Température',
            severity: incident.severity,
            description: incident.description
          });
          console.log('✅ Email température envoyé !');
        } catch (emailError) {
          console.error('❌ Erreur email température :', emailError.message);
        }
      }
    }

    if (humidity > THRESHOLDS.humidity) {
      await Incident.create({
        room: room._id,
        type: 'autre',
        severity: 'moyen',
        description: `Humidité élevée détectée : ${humidity}% (seuil : ${THRESHOLDS.humidity}%)`,
        resolved: false
      });
    }

    if (smoke) {
      await Incident.create({
        room: room._id,
        type: 'fumee',
        severity: 'critique',
        description: 'Détection de fumée dans la salle serveur !',
        resolved: false
      });

      console.log('🔥 Fumée détectée - envoi email...');
      try {
        await sendAlertEmail({
          to: process.env.EMAIL_USER,
          subject: '🚨 Alerte Critique - Fumée détectée !',
          roomName: room.name,
          type: 'Fumée',
          severity: 'critique',
          description: 'Détection de fumée dans la salle serveur !'
        });
        console.log('✅ Email fumée envoyé !');
      } catch (emailError) {
        console.error('❌ Erreur email fumée :', emailError.message);
      }
    }

    if (powerCut) {
      await Incident.create({
        room: room._id,
        type: 'coupure_electrique',
        severity: 'critique',
        description: 'Coupure électrique détectée !',
        resolved: false
      });

      console.log('⚡ Coupure électrique - envoi email...');
      try {
        await sendAlertEmail({
          to: process.env.EMAIL_USER,
          subject: '🚨 Alerte Critique - Coupure électrique !',
          roomName: room.name,
          type: 'Coupure électrique',
          severity: 'critique',
          description: 'Coupure électrique détectée !'
        });
        console.log('✅ Email coupure envoyé !');
      } catch (emailError) {
        console.error('❌ Erreur email coupure :', emailError.message);
      }
    }

    res.status(201).json({ message: '✅ Données reçues avec succès', sensorData });

  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

exports.getLatestByRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable' });
    }
    const latest = await SensorData.findOne({ room: req.params.roomId })
      .sort({ createdAt: -1 });
    res.status(200).json(latest);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

exports.getHistoryByRoom = async (req, res) => {
  try {
    const history = await SensorData.find({ room: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};

exports.getAllLatest = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true });
    const result = await Promise.all(rooms.map(async (room) => {
      const latest = await SensorData.findOne({ room: room._id })
        .sort({ createdAt: -1 });
      return {
        room: room.name,
        roomId: room._id,
        data: latest
      };
    }));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: '❌ Erreur serveur', error: error.message });
  }
};