const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scientificName: { type: String, required: true },
  remedies: { type: Object, required: false },
  imageUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Archive', ArchiveSchema);
