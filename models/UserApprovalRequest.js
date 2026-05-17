const mongoose = require('mongoose');

const userApprovalRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  password: { type: String, required: true }, // Hash
  role: {
    type: String,
    enum: ['admin', 'responsable_site', 'technicien'],
    default: 'technicien'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
  rejectionReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('UserApprovalRequest', userApprovalRequestSchema);
