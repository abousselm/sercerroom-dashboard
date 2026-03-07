const mongoose = require('mongoose');

const eolAlertSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  endOfLife: { type: Date, required: true },       // date EOL de l'équipement
  daysRemaining: { type: Number, required: true }, // jours restants avant EOL
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'critique'],         // info: >90j, warning: <90j, critique: <30j
    required: true 
  },
  emailSent: { type: Boolean, default: false },    // email envoyé ou pas
  resolved: { type: Boolean, default: false }      // traité ou pas
}, { timestamps: true });

module.exports = mongoose.model('EolAlert', eolAlertSchema);