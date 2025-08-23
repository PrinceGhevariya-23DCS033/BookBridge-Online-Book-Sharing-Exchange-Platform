const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Book = require('../models/book.model');
const User = require('../models/user.model');

// Create a new book
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition'),
  body('isbn').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      isbn: req.body.isbn,
      condition: req.body.condition,
      owner: req.user._id,
      status: 'available',
      type: 'donated',
      category: 'free', // Set category as free for donated books
      sellerContact: {
        email: req.body.contactEmail || req.user.email || '',
        phone: req.body.contactPhone || req.user.phone || '',
        address: req.body.contactAddress || req.user.location || ''
      }
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Error creating book' });
  }
});

// Donate a book
router.post('/donate', [
  auth,
  upload.single('image'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition'),
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
      type: 'donated',
      category: 'free', // Set category as free for donated books
      image: req.file.path,
      owner: req.user._id,
      sellerContact: {
        email: req.body.contactEmail || req.user.email || '',
        phone: req.body.contactPhone || req.user.phone || '',
        address: req.body.contactAddress || req.user.location || ''
      }
    });

    await book.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.donated': 1 }
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error donating book' });
  }
});

// Get all available books
router.get('/', async (req, res) => {
  try {
    const { genre, type, search } = req.query;
    const query = { status: 'available' };

    if (genre) query.genre = genre;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const books = await Book.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// Get book details
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('owner', 'name email location')
      .populate('matchedRequest');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book details' });
  }
});

// Get user's donated books
router.get('/donated/my', auth, async (req, res) => {
  try {
    const books = await Book.find({
      owner: req.user._id,
      type: 'donated'
    }).sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donated books' });
  }
});

// Update book status
router.put('/:id/status', [
  auth,
  body('status').isIn(['available', 'reserved', 'fulfilled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.status = req.body.status;
    await book.save();

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book status' });
  }
});

// Create or get book from Google Books API
router.post('/google', auth, async (req, res) => {
  try {
    const { googleBooksId, type, condition, price } = req.body;

    if (!googleBooksId) {
      return res.status(400).json({ message: 'Google Books ID is required' });
    }

    // Check if book already exists
    let book = await Book.findOne({ googleBooksId });

    if (!book) {
      // Fetch book details from Google Books API
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`);
      const data = await response.json();

      if (!data || data.error) {
        return res.status(404).json({ message: 'Book not found in Google Books API' });
      }

      // Get price from Google Books API or use provided price
      let bookPrice = 0;
      
      // Try to get price from Google Books API
      if (data.saleInfo?.listPrice?.amount) {
        bookPrice = data.saleInfo.listPrice.amount;
      } else if (data.saleInfo?.retailPrice?.amount) {
        bookPrice = data.saleInfo.retailPrice.amount;
      } else if (price) {
        bookPrice = price;
      } else {
        // Set a default price based on book type
        bookPrice = type === 'sold' ? 19.99 : (type === 'new' ? 24.99 : 0);
      }

      // Get image URL and ensure it's using HTTPS
      let imageUrl = 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image';
      if (data.volumeInfo?.imageLinks?.thumbnail) {
        imageUrl = data.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://');
      }

      // Create new book
      const bookType = type || 'sold';
      book = new Book({
        title: data.volumeInfo.title,
        author: data.volumeInfo.authors?.[0] || 'Unknown Author',
        genre: data.volumeInfo.categories?.[0] || 'Uncategorized',
        description: data.volumeInfo.description || 'No description available',
        image: imageUrl,
        isbn: data.volumeInfo.industryIdentifiers?.[0]?.identifier,
        condition: condition || 'new',
        type: bookType,
        category: bookType === 'donated' ? 'free' : 'sale', // Set category based on type
        price: bookPrice,
        owner: req.user._id,
        status: 'available',
        isAvailable: true,
        marketplaceStatus: 'active',
        googleBooksId,
        sellerContact: {
          email: req.body.contactEmail || req.user.email || '',
          phone: req.body.contactPhone || req.user.phone || '',
          address: req.body.contactAddress || req.user.location || ''
        }
      });

      await book.save();
    }

    res.json(book);
  } catch (error) {
    console.error('Error creating/getting book from Google Books:', error);
    res.status(500).json({ 
      message: 'Error creating/getting book from Google Books',
      error: error.message 
    });
  }
});

module.exports = router; 