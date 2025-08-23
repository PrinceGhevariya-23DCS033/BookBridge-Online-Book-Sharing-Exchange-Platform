const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const Sponsorship = require('../models/sponsorship.model');
const Request = require('../models/request.model');
const User = require('../models/user.model');

// Get all requests for sponsor page
router.get('/requests', auth, async (req, res) => {
  try {
    console.log('Fetching sponsor requests...');
    
    // Get all requests from the database
    const requests = await Request.find({})
      .populate({
        path: 'requester',
        select: 'name email role',
        model: 'User'
      })
      .sort({ priority: -1, createdAt: -1 }) // Sort by priority and creation date
      .lean();
    
    console.log(`Found ${requests.length} requests in database`);
    
    // Transform the data to ensure all fields are properly formatted
    const formattedRequests = requests.map(request => {
      return {
        _id: request._id.toString(),
        title: request.book?.title || 'Untitled',
        author: request.book?.author || 'Unknown Author',
        isbn: request.book?.isbn || 'No ISBN',
        genre: request.book?.genre || 'Uncategorized',
        description: request.description || 'No description available',
        reason: request.reason || 'No reason provided',
        urgency: request.urgency || 'medium',
        status: request.status || 'pending',
        priority: request.priority || 0,
        quantity: request.quantity || 1,
        documents: request.documents || [],
        coverImage: request.coverImage || '',
        address: request.address || null,
        requester: request.requester ? {
          _id: request.requester._id.toString(),
          name: request.requester.name || 'Unknown',
          email: request.requester.email || 'No email provided',
          role: request.requester.role || 'student'
        } : null,
        createdAt: request.createdAt ? request.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: request.updatedAt ? request.updatedAt.toISOString() : new Date().toISOString()
      };
    });

    console.log('Sending formatted requests to client');
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching sponsor requests:', error);
    res.status(500).json({ 
      message: 'Error fetching sponsor requests',
      error: error.message 
    });
  }
});

// Update request status (approve/reject)
router.patch('/requests/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ 
      message: 'Error updating request status',
      error: error.message 
    });
  }
});

// Get request details
router.get('/requests/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findById(id)
      .populate({
        path: 'requester',
        select: 'name email role',
        model: 'User'
      });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({ 
      message: 'Error fetching request details',
      error: error.message 
    });
  }
});

// Sponsor a request
router.post('/:requestId/pay', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('paymentId').notEmpty().withMessage('Payment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not available for sponsorship' });
    }

    // Create sponsorship record
    const sponsorship = new Sponsorship({
      sponsor: req.user._id,
      request: request._id,
      amount: req.body.amount,
      paymentId: req.body.paymentId,
      status: 'completed'
    });

    await sponsorship.save();

    // Update request with sponsorship
    request.sponsorship = sponsorship._id;
    await request.save();

    // Update sponsor's stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.sponsored': 1 }
    });

    res.status(201).json(sponsorship);
  } catch (error) {
    res.status(500).json({ message: 'Error processing sponsorship' });
  }
});

// Get user's sponsorship history
router.get('/my', auth, async (req, res) => {
  try {
    const sponsorships = await Sponsorship.find({ sponsor: req.user._id })
      .populate({
        path: 'request',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sponsorship history' });
  }
});

// Get sponsorship details
router.get('/:id', auth, async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id)
      .populate({
        path: 'request',
        populate: {
          path: 'user',
          select: 'name email location'
        }
      })
      .populate('sponsor', 'name email');

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is either sponsor or request owner
    if (sponsorship.sponsor._id.toString() !== req.user._id.toString() &&
        sponsorship.request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this sponsorship' });
    }

    res.json(sponsorship);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sponsorship details' });
  }
});

module.exports = router; 