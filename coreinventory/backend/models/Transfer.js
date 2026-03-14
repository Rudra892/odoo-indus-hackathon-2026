const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'],
    default: 'Draft'
  },
  scheduledDate: { type: Date },
  responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', transferSchema);
