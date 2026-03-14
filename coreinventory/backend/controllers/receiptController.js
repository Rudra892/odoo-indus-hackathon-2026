const Receipt = require('../models/Receipt');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const Warehouse = require('../models/Warehouse');
const generateReference = require('../utils/generateReference');

exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { referenceNo: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    const receipts = await Receipt.find(query)
      .populate('products.productId')
      .populate('responsible', 'name email')
      .populate('toWarehouse', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: receipts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const referenceNo = await generateReference('WH/IN', 'Receipt');
    const receipt = new Receipt({
      ...req.body,
      referenceNo,
      status: 'Draft',
      responsible: req.user ? req.user.id : null // req.user populated via auth middleware
    });
    
    await receipt.save();
    const populated = await receipt.populate('products.productId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft receipts can be updated' });

    const { supplier, products, scheduledDate, sourceDocument, toWarehouse, fromLocation } = req.body;
    if (supplier) receipt.supplier = supplier;
    if (products) receipt.products = products;
    if (scheduledDate) receipt.scheduledDate = scheduledDate;
    if (sourceDocument) receipt.sourceDocument = sourceDocument;
    if (toWarehouse) receipt.toWarehouse = toWarehouse;
    if (fromLocation) receipt.fromLocation = fromLocation;

    await receipt.save();
    const populated = await receipt.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirm = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft receipts can be confirmed' });

    receipt.status = 'Waiting';
    await receipt.save();
    const populated = await receipt.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status === 'Done') return res.status(400).json({ success: false, message: 'Receipt already validated' });
    if (receipt.status === 'Canceled') return res.status(400).json({ success: false, message: 'Cannot validate a canceled receipt' });

    let warehouseName = receipt.toWarehouse;
    if (receipt.toWarehouse) {
      const wh = await Warehouse.findById(receipt.toWarehouse);
      if (wh) warehouseName = wh.name;
    }

    // Process Stock Logic
    for (const item of receipt.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { currentStock: item.quantity } });
      await InventoryMovement.create({
        type: 'receipt',
        referenceNo: receipt.referenceNo,
        productId: item.productId,
        quantity: item.quantity,
        fromLocation: receipt.supplier,
        toLocation: warehouseName,
        performedBy: req.user ? req.user.id : null,
        status: 'Done'
      });
    }

    receipt.status = 'Done';
    receipt.validatedAt = Date.now();
    await receipt.save();
    const populated = await receipt.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status === 'Done') return res.status(400).json({ success: false, message: 'Cannot cancel a validated receipt' });

    receipt.status = 'Canceled';
    await receipt.save();
    const populated = await receipt.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (receipt.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft receipts can be deleted' });

    await Receipt.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Receipt deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
