const mongoose = require('mongoose');

const referenceImageSchema = new mongoose.Schema({
  grid: {
    type: [[String]],
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ReferenceImage', referenceImageSchema);