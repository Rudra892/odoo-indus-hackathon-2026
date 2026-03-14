const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['receipt', 'delivery', 'transfer', 'adjustment'],
    required: true 
  },
  referenceNo: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number },
  fromLocation: { type: String },
  toLocation: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Done' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
