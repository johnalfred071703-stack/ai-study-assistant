const mongoose = require('mongoose');

const reviewerCacheSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  mode: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

reviewerCacheSchema.index({ documentId: 1, mode: 1 }, { unique: true });

module.exports = mongoose.model('ReviewerCache', reviewerCacheSchema);