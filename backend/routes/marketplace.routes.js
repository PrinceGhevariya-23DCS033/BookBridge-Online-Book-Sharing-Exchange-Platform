const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Book = require('../models/book.model');
const User = require('../models/user.model');

// List a book for sale
router.post('/sell', [
  auth,
  upload.single('image'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Book image is required' });
    }

    const book = new Book({
      ...req.body,
      type: 'sold',
      image: req.file.path,
      owner: req.user._id
    });

    await book.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.sold': 1 }
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error listing book for sale' });
  }
});

// Get marketplace listings
router.get('/', async (req, res) => {
  try {
    const { genre, minPrice, maxPrice, search } = req.query;
    const query = {
      type: 'sold',
      status: 'available'
    };

    if (genre) query.genre = genre;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const books = await Book.find(query)
      .populate('owner', 'name email location')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marketplace listings' });
  }
});

// Get user's marketplace listings
router.get('/my', auth, async (req, res) => {
  try {
    const books = await Book.find({
      owner: req.user._id,
      type: 'sold'
    }).sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your listings' });
  }
});

// Update listing
router.put('/:id', [
  auth,
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id,
      type: 'sold'
    });

    if (!book) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Cannot update non-available listing' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['price', 'description'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => book[update] = req.body[update]);
    await book.save();

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing' });
  }
});

// Remove listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id,
      type: 'sold'
    });

    if (!book) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Cannot remove non-available listing' });
    }

    await book.remove();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.sold': -1 }
    });

    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing listing' });
  }
});

module.exports = router; 