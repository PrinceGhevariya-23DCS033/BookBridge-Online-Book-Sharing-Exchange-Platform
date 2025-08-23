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
  body('description').optional().trim(),
  body('listingType').optional().isIn(['sale', 'rent']).withMessage('Invalid listing type'),
  body('contactEmail').trim().notEmpty().withMessage('Contact email is required'),
  body('contactPhone').optional().trim(),
  body('contactAddress').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let imageUrl = 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image';
    
    if (req.file) {
      imageUrl = req.file.path;
    } else if (req.body.image) {
      // Handle base64 image or URL
      imageUrl = req.body.image;
    }

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      condition: req.body.condition,
      price: req.body.price,
      description: req.body.description,
      type: 'sold',
      image: imageUrl,
      owner: req.user._id,
      sellerContact: {
        email: req.body.contactEmail,
        phone: req.body.contactPhone || '',
        address: req.body.contactAddress || ''
      },
      status: 'available',
      isAvailable: true,
      marketplaceStatus: 'active'
    });

    await book.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.sold': 1 }
    });

    // Populate owner data for response
    await book.populate('owner', 'name email location');

    res.status(201).json(book);
  } catch (error) {
    console.error('Error listing book for sale:', error);
    res.status(500).json({ message: 'Error listing book for sale' });
  }
});

// Get marketplace listings
router.get('/', async (req, res) => {
  try {
    console.log('=== MARKETPLACE REQUEST ===');
    console.log('Query params:', req.query);
    
    const { genre, minPrice, maxPrice, search, condition, listingType } = req.query;
    const query = {
      type: { $in: ['sold', 'donated'] }, // Include both sold and donated books
      status: 'available',
      marketplaceStatus: 'active'
    };

    if (genre) query.genre = genre;
    if (condition && condition !== 'all') query.condition = condition;
    if (listingType && listingType !== 'all') {
      // Map frontend listing types to backend data
      if (listingType === 'sale') {
        query.type = 'sold';
      } else if (listingType === 'free' || listingType === 'donated') {
        query.type = 'donated';
      }
      // Add more mapping as needed
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    console.log('Final query:', query);

    const books = await Book.find(query)
      .populate('owner', 'name email location phone address')
      .sort({ createdAt: -1 });

    console.log('Found books:', books.length);
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - Type: ${book.type} - Category: ${book.category} - Owner: ${book.owner?.name || 'No owner'}`);
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching marketplace listings' });
  }
});

// Get specific marketplace book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      type: { $in: ['sold', 'donated'] }, // Include both sold and donated books
      marketplaceStatus: 'active'
    }).populate('owner', 'name email location');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error fetching marketplace book:', error);
    res.status(500).json({ message: 'Error fetching book details' });
  }
});

// Get contact details for a book (requires authentication)
router.get('/:id/contact', auth, async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      type: { $in: ['sold', 'donated'] }, // Include both sold and donated books
      marketplaceStatus: 'active'
    }).populate('owner', 'name email location');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Return contact details
    const contactInfo = {
      sellerName: book.owner.name,
      email: book.sellerContact.email,
      phone: book.sellerContact.phone,
      address: book.sellerContact.address,
      ownerEmail: book.owner.email, // Fallback to owner email
      ownerLocation: book.owner.location
    };

    res.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact details:', error);
    res.status(500).json({ message: 'Error fetching contact details' });
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