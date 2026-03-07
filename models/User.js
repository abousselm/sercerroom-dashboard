const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'responsable_site', 'technicien'], 
    default: 'technicien' 
  },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
  rfidCard: { type: String, default: null }, // carte RFID associée
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);