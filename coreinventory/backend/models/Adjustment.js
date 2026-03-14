const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  recordedQty: { type: Number, required: true },
  actualQty: { type: Number, required: true },
  difference: { type: Number },
  reason: { type: String },
  status: { type: String, enum: ['Draft', 'Done'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adjustment', adjustmentSchema);
