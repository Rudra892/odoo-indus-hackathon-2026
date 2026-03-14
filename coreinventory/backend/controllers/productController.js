const Product = require('../models/Product');

exports.getAll = async (req, res) => {
  try {
    const { search, category, warehouseId, lowStock } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (warehouseId) query.warehouseId = warehouseId;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$lowStockThreshold'] };
    }

    const products = await Product.find(query).populate('warehouseId locationId');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, sku, category, unit, initialStock, currentStock, ...rest } = req.body;
    const existing = await Product.findOne({ sku });
    if (existing) return res.status(400).json({ success: false, message: 'SKU already exists' });

    const product = new Product({
      name, sku, category, unit,
      currentStock: initialStock || currentStock || 0,
      ...rest
    });
    
    await product.save();
    const populated = await product.populate('warehouseId locationId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('warehouseId');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
