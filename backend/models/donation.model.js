const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  description: {
    type: String,
    required: true
  },
  donationType: {
    type: String,
    required: true,
    enum: ['physical', 'sponsor'],
    default: 'physical'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donation', donationSchema); 