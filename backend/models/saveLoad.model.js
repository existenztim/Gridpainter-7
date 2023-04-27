const mongoose = require('mongoose');

const SaveLoadImageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  grid: {
    type: [[String]],
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('images', SaveLoadImageSchema);
