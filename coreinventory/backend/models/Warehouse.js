const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomCode: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
