const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  currentStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  reorderQty: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
