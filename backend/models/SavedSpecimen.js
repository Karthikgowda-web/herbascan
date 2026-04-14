const mongoose = require('mongoose');

const SavedSpecimenSchema = new mongoose.Schema({
  plant_name: { type: String, required: true },
  scientific_name: { type: String, required: true },
  image_url: { type: String, required: true },
  overview: {
    en: String, hi: String, kn: String
  },
  remedies: {
    en: String, hi: String, kn: String
  },
  alternatives: {
    en: [String], hi: [String], kn: [String]
  },
  medicinalProperties: [String],
  warnings: String,
  cnnAnalysis: {
    confidence: Number,
    featuresIdentified: [String],
    neuralMarkers: String
  }
}, { timestamps: true });

module.exports = mongoose.model('SavedSpecimen', SavedSpecimenSchema);
