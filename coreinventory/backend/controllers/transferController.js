const Transfer = require('../models/Transfer');
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
      query.referenceNo = { $regex: search, $options: 'i' };
    }

    const transfers = await Transfer.find(query)
      .populate('products.productId')
      .populate('fromWarehouse', 'name')
      .populate('toWarehouse', 'name')
      .populate('responsible', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: transfers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fromWarehouse, toWarehouse } = req.body;
    if (fromWarehouse === toWarehouse) {
      return res.status(400).json({ success: false, message: 'Source and destination warehouses must be different' });
    }

    const referenceNo = await generateReference('WH/INT', 'Transfer');
    const transfer = new Transfer({
      ...req.body,
      referenceNo,
      status: 'Draft',
      responsible: req.user ? req.user.id : null
    });
    
    await transfer.save();
    const populated = await transfer.populate('products.productId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft transfers can be updated' });

    Object.assign(transfer, req.body);
    await transfer.save();
    const populated = await transfer.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status === 'Done') return res.status(400).json({ success: false, message: 'Transfer already validated' });
    if (transfer.status === 'Canceled') return res.status(400).json({ success: false, message: 'Cannot validate canceled transfer' });

    let fromName = 'Unknown', toName = 'Unknown';
    if (transfer.fromWarehouse) {
      const w1 = await Warehouse.findById(transfer.fromWarehouse);
      if (w1) fromName = w1.name;
    }
    if (transfer.toWarehouse) {
      const w2 = await Warehouse.findById(transfer.toWarehouse);
      if (w2) toName = w2.name;
    }

    // Process Stock Logic
    for (const item of transfer.products) {
      if (!item.productId) continue;
      
      const updatePayload = { warehouseId: transfer.toWarehouse };
      if (transfer.toLocation) updatePayload.locationId = transfer.toLocation;

      await Product.findByIdAndUpdate(item.productId, updatePayload);
      
      await InventoryMovement.create({
        type: 'transfer',
        referenceNo: transfer.referenceNo,
        productId: item.productId,
        quantity: item.quantity,
        fromLocation: fromName,
        toLocation: toName,
        performedBy: req.user ? req.user.id : null,
        status: 'Done'
      });
    }

    transfer.status = 'Done';
    await transfer.save();
    const populated = await transfer.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status === 'Done') return res.status(400).json({ success: false, message: 'Cannot cancel a validated transfer' });

    transfer.status = 'Canceled';
    await transfer.save();
    const populated = await transfer.populate('products.productId');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft transfers can be deleted' });

    await Transfer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transfer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
