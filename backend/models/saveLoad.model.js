const mongoose = require('mongoose');

const saveLoadImageSchema = new mongoose.Schema({
  grid: {
    type: [[String]],
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('images', saveLoadImageSchema);
