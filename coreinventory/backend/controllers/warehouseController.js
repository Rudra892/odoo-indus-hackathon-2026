const Warehouse = require('../models/Warehouse');

exports.getAll = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.json({ success: true, data: warehouse });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.json({ success: true, message: 'Warehouse deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
