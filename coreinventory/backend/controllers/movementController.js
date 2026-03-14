const InventoryMovement = require('../models/InventoryMovement');

exports.getAll = async (req, res) => {
  try {
    const { search, type, startDate, endDate } = req.query;
    const query = {};

    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.referenceNo = { $regex: search, $options: 'i' };
    }

    const movements = await InventoryMovement.find(query)
      .populate('productId', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: movements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
