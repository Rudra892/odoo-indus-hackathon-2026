const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  referenceNo: { type: String, unique: true },
  supplier: { type: String, required: true },
  fromLocation: { type: String },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    receivedQty: { type: Number, default: 0 }
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

module.exports = mongoose.model('Receipt', receiptSchema);
