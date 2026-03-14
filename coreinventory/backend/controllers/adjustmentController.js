const Adjustment = require('../models/Adjustment');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const generateReference = require('../utils/generateReference');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.referenceNo = { $regex: search, $options: 'i' };
    }

    const adjustments = await Adjustment.find(query)
      .populate('productId')
      .populate('warehouseId', 'name')
      .populate('locationId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: adjustments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { productId, actualQty, recordedQty } = req.body;
    
    // Safety check calculation
    const difference = actualQty - recordedQty;
    const referenceNo = await generateReference('WH/ADJ', 'Adjustment');

    const adjustment = new Adjustment({
      ...req.body,
      referenceNo,
      difference,
      status: 'Done'
    });
    
    await adjustment.save();

    // Update Product Stock
    await Product.findByIdAndUpdate(productId, { currentStock: actualQty });

    // Log Movement
    await InventoryMovement.create({
      type: 'adjustment',
      referenceNo,
      productId,
      quantity: difference,
      fromLocation: 'System',
      toLocation: 'Adjusted',
      performedBy: req.user ? req.user.id : null,
        status: 'Done'
    });

    const populated = await adjustment.populate('productId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
