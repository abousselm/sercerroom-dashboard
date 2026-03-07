const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  esp32Id: { type: String, default: null }, // identifiant de l'ESP32 associé
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);