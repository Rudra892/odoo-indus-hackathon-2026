const Location = require('../models/Location');

exports.getAll = async (req, res) => {
  try {
    const { warehouseId } = req.query;
    const query = warehouseId ? { warehouseId } : {};
    const locations = await Location.find(query).populate('warehouseId').sort({ createdAt: -1 });
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    const populated = await location.populate('warehouseId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('warehouseId');
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
