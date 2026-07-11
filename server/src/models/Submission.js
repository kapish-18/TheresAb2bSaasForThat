const mongoose = require('mongoose');

// Two submission shapes, distinguished by `type`:
// - 'new_competitor': someone's adding a competitor to an EXISTING problem (has problemSlug)
// - 'new_problem': someone's suggesting a brand new problem that didn't match anything
const submissionSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_competitor', 'new_problem'], required: true },

  // populated for new_competitor submissions
  problemSlug: { type: String, default: null },

  // populated for new_problem submissions
  problemText: { type: String, default: null },

  competitorName: { type: String, required: true },
  competitorDescription: { type: String, required: true },
  competitorUrl: { type: String, default: null },
  isReal: { type: Boolean, default: true },

  submitterNote: { type: String, default: '' },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
