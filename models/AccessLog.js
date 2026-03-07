const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  rfidCard: { type: String, required: true },
  accessGranted: { type: Boolean, required: true }, // true = autorisé, false = refusé
  reason: { type: String, default: null } // raison du refus si non autorisé
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', accessLogSchema);