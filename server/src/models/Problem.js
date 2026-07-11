const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, default: null },
  isReal: { type: Boolean, required: true, default: true }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  keywords: { type: [String], default: [] },
  competitors: { type: [competitorSchema], default: [] },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

problemSchema.index({ text: 'text', keywords: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
