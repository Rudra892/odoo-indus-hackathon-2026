const Delivery = require('../models/Delivery');
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
        { customer: { $regex: search, $options: 'i' } }
      ];
    }

    const deliveries = await Delivery.find(query)
      .populate('products.productId')
      .populate('responsible', 'name email')
      .populate('fromWarehouse', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const referenceNo = await generateReference('WH/OUT', 'Delivery');
    const delivery = new Delivery({
      ...req.body,
      referenceNo,
      status: 'Draft',
      responsible: req.user ? req.user.id : null
    });
    
    await delivery.save();
    const populated = await delivery.populate('products.productId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (delivery.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft deliveries can be updated' });

    Object.assign(delivery, req.body);

    await delivery.save();
    const populated = await delivery.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirm = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (delivery.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft deliveries can be confirmed' });

    delivery.status = 'Waiting';
    await delivery.save();
    const populated = await delivery.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('products.productId');
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (delivery.status === 'Done') return res.status(400).json({ success: false, message: 'Delivery already validated' });
    if (delivery.status === 'Canceled') return res.status(400).json({ success: false, message: 'Cannot validate canceled delivery' });

    // Validate stock
    for (const item of delivery.products) {
      if (!item.productId) continue;
      const prod = await Product.findById(item.productId._id);
      if (prod.currentStock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Required: ${item.quantity}` 
        });
      }
    }

    let warehouseName = delivery.fromWarehouse;
    if (delivery.fromWarehouse) {
      const wh = await Warehouse.findById(delivery.fromWarehouse);
      if (wh) warehouseName = wh.name;
    }

    // Process Stock Update & History
    for (const item of delivery.products) {
      await Product.findByIdAndUpdate(item.productId._id, { $inc: { currentStock: -item.quantity } });
      await InventoryMovement.create({
        type: 'delivery',
        referenceNo: delivery.referenceNo,
        productId: item.productId._id,
        quantity: item.quantity,
        fromLocation: warehouseName,
        toLocation: delivery.customer,
        performedBy: req.user ? req.user.id : null,
        status: 'Done'
      });
    }

    delivery.status = 'Done';
    delivery.validatedAt = Date.now();
    await delivery.save();
    const populated = await delivery.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (delivery.status === 'Done') return res.status(400).json({ success: false, message: 'Cannot cancel a validated delivery' });

    delivery.status = 'Canceled';
    await delivery.save();
    const populated = await delivery.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (delivery.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft deliveries can be deleted' });

    await Delivery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Delivery deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
