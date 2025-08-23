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
  body('donationType').isIn(['physical', 'sponsor']).withMessage('Invalid donation type'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('contactPhone').optional().trim(),
  body('contactAddress').optional().trim()
];

// Create a new donation
router.post('/', auth, upload.array('images', 5), validateDonation, async (req, res) => {
  try {
    console.log('=== DONATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
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
        category: 'free', // Set category as free for donated books
        isAvailable: true,
        marketplaceStatus: 'active',
        price: 0,
        currency: 'INR',
        sellerContact: {
          email: req.body.contactEmail || req.user.email || '',
          phone: req.body.contactPhone || req.user.phone || '',
          address: req.body.contactAddress || req.user.location || ''
        }
      };

      // If there are images, use the first one as the book image
      if (req.files && req.files.length > 0) {
        bookData.image = `/uploads/${req.files[0].filename}`;
      }

      book = new Book(bookData);
      console.log('Creating new book:', bookData);
      await book.save();
      console.log('Book saved successfully:', book._id);
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
    console.log('Donation saved successfully:', donation._id);

    // IMPORTANT: After donation is created, ensure the book is available in marketplace
    // Update the book to ensure it's available for marketplace
    await Book.findByIdAndUpdate(book._id, {
      status: 'available',
      type: 'donated',
      category: 'free',
      isAvailable: true,
      marketplaceStatus: 'active',
      price: 0
    });
    console.log('Book updated for marketplace availability:', book._id);

    // Populate the response with book and donor details
    const populatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name email')
      .populate('book', 'title author');

    console.log('Populated donation:', populatedDonation);
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

// Fix existing donated books (temporary route to update existing donations)
router.post('/fix-marketplace', auth, async (req, res) => {
  try {
    console.log('=== FIXING EXISTING DONATED BOOKS ===');
    
    // Get all donations
    const donations = await Donation.find({}).populate('book');
    console.log('Found donations:', donations.length);
    
    let updatedCount = 0;
    
    for (const donation of donations) {
      if (donation.book) {
        await Book.findByIdAndUpdate(donation.book._id, {
          status: 'available',
          type: 'donated',
          category: 'free',
          isAvailable: true,
          marketplaceStatus: 'active',
          price: 0
        });
        console.log(`Updated book: ${donation.book.title}`);
        updatedCount++;
      }
    }
    
    console.log(`Fixed ${updatedCount} donated books for marketplace`);
    res.json({ message: `Fixed ${updatedCount} donated books for marketplace`, updatedCount });
  } catch (error) {
    console.error('Error fixing donated books:', error);
    res.status(500).json({ message: 'Error fixing donated books', error: error.message });
  }
});

module.exports = router; 