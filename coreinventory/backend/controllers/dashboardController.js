const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');
const InventoryMovement = require('../models/InventoryMovement');

exports.getKPIs = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    // Low stock involves documents where 0 < currentStock <= lowStockThreshold
    const lowStock = await Product.countDocuments({
      $expr: {
        $and: [
          { $gt: ['$currentStock', 0] },
          { $lte: ['$currentStock', '$lowStockThreshold'] }
        ]
      }
    });

    const outOfStock = await Product.countDocuments({ currentStock: 0 });
    
    const pendingReceipts = await Receipt.countDocuments({ 
      status: { $in: ['Draft', 'Waiting', 'Ready'] } 
    });
    
    const pendingDeliveries = await Delivery.countDocuments({ 
      status: { $in: ['Draft', 'Waiting', 'Ready'] } 
    });

    const totalTransfers = await Transfer.countDocuments();

    const recentActivity = await InventoryMovement.find()
      .populate('productId', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStock,
        outOfStock,
        pendingReceipts,
        pendingDeliveries,
        totalTransfers,
        recentActivity
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
