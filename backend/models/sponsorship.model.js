const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  paymentDetails: {
    type: Object
  }
}, {
  timestamps: true
});

// Index for efficient querying
sponsorshipSchema.index({ sponsor: 1, status: 1 });
sponsorshipSchema.index({ request: 1, status: 1 });

const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);

module.exports = Sponsorship; 