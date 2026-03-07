const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  esp32Id: { type: String, required: true },
  temperature: { type: Number, default: null },
  humidity: { type: Number, default: null },
  smoke: { type: Boolean, default: false },
  doorOpen: { type: Boolean, default: false },
  powerCut: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SensorData', sensorDataSchema);