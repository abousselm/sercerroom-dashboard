const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },          // ex: "Switch Cisco 2960"
  type: { 
    type: String, 
    enum: ['serveur', 'switch', 'routeur', 'ups', 'climatiseur', 'autre'],
    required: true 
  },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  serialNumber: { type: String, default: null },   // numéro de série
  installDate: { type: Date, default: null },      // date d'installation
  endOfLife: { type: Date, default: null },        // date fin de vie
  status: { 
    type: String, 
    enum: ['actif', 'en_panne', 'maintenance', 'hors_service'],
    default: 'actif' 
  },
  responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);