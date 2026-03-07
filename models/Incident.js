const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  type: { 
    type: String, 
    enum: ['temperature', 'fumee', 'acces_refuse', 'coupure_electrique', 'autre'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['faible', 'moyen', 'critique'], 
    required: true 
  },
  description: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);