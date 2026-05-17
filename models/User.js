const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'responsable_site', 'technicien'], 
    default: 'technicien' 
  },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
  rfidCard: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isSuperAdmin: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);