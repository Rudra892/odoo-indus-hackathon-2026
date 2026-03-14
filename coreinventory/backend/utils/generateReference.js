const mongoose = require('mongoose');

async function generateReference(prefix, modelName) {
  const Model = mongoose.model(modelName);
  const latestDoc = await Model.findOne().sort({ createdAt: -1 });
  
  let nextNumber = 1;
  if (latestDoc && latestDoc.referenceNo) {
    const parts = latestDoc.referenceNo.split('/');
    if (parts.length > 2) {
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
  }

  const paddedNumber = String(nextNumber).padStart(5, '0');
  return `${prefix}/${paddedNumber}`;
}

module.exports = generateReference;
