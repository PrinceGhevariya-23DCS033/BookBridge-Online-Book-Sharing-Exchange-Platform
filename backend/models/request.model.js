const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    isbn: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      required: true
    }
  },
  description: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  priority: {
    type: Number,
    default: 0
  },
  documents: [{
    type: String // URLs to uploaded documents
  }],
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate priority based on urgency and request time
requestSchema.pre('save', function(next) {
  const urgencyWeights = {
    high: 3,
    medium: 2,
    low: 1
  };
  
  const timeWeight = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60)); // hours
  this.priority = urgencyWeights[this.urgency] * 10 - timeWeight;
  
  next();
});

// Index for efficient querying
requestSchema.index({ status: 1, priority: -1 });
requestSchema.index({ 'book.title': 'text', 'book.author': 'text', 'book.genre': 'text' });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request; 