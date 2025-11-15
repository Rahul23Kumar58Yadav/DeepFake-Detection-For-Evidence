const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['video', 'audio', 'image'],
    required: true,
  },
  fileSize: {
    type: Number,
  },
  result: {
    type: String,
    enum: ['REAL', 'FAKE', 'UNCERTAIN'],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  analysisDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
detectionSchema.index({ userId: 1, createdAt: -1 });
detectionSchema.index({ result: 1 });
detectionSchema.index({ fileType: 1 });

const Detection = mongoose.model('Detection', detectionSchema);

module.exports = Detection;