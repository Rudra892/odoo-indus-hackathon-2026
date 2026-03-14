const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  customer: { type: String, required: true },
  deliveryAddress: { type: String },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  deliveryType: { type: String, enum: ['Incoming', 'Outgoing'], default: 'Outgoing' },
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
  sourceDocument: { type: String },
  responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);
