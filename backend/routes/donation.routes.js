const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Donation = require('../models/donation.model');
const Book = require('../models/book.model');

// Validation middleware
const validateDonation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition'),
  body('description').notEmpty().withMessage('Description is required'),
  body('donationType').isIn(['physical', 'sponsor']).withMessage('Invalid donation type')
];

// Create a new donation
router.post('/', auth, upload.array('images', 5), validateDonation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, quantity, condition, description, donationType } = req.body;
    
    // If bookId is 'new', create a new book first
    let book;
    if (bookId === 'new') {
      // Create book with data from form
      const bookData = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre || 'Other',
        isbn: req.body.isbn,
        description: req.body.description,
        condition: condition,
        owner: req.user.id.toString(), // Convert to string to ensure proper ObjectId handling
        status: 'available',
        type: 'donated',
        isAvailable: true,
        marketplaceStatus: 'active',
        price: 0,
        currency: 'INR'
      };

      // If there are images, use the first one as the book image
      if (req.files && req.files.length > 0) {
        bookData.image = `/uploads/${req.files[0].filename}`;
      }

      book = new Book(bookData);
      await book.save();
    } else {
      // Check if existing book exists and update its status
      book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      // Update book status to available
      book.status = 'available';
      book.isAvailable = true;
      book.marketplaceStatus = 'active';
      await book.save();
    }

    // Create donation
    const donation = new Donation({
      donor: req.user.id.toString(), // Convert to string to ensure proper ObjectId handling
      book: book._id,
      quantity: parseInt(quantity),
      condition,
      description,
      donationType: donationType || 'physical',
      images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
    });

    await donation.save();

    // Populate the response with book and donor details
    const populatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('book', 'title author');

    res.status(201).json(populatedDonation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ 
      message: 'Error creating donation',
      error: error.message 
    });
  }
});

// Get all donations
router.get('/', auth, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's donations
router.get('/my-donations', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single donation
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('book', 'title author');
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update donation status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    donation.status = status;
    await donation.save();
    
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 