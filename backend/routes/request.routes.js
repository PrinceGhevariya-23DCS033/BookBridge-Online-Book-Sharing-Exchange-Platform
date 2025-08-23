const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Request = require('../models/request.model');
const Book = require('../models/book.model');

// Dashboard stats and recent activity endpoint
router.get('/dashboard', auth, async (req, res) => {
  console.log('DASHBOARD ROUTE HIT', req.user);
  try {
    const userId = req.user._id || req.user.id;
    console.log('Counting donated books...');
    const donatedBooks = await Book.countDocuments({ owner: userId, type: 'donated' });
    console.log('Donated books:', donatedBooks);
    const sponsoredBooks = 0;
    console.log('Counting marketplace purchases...');
    const marketplacePurchases = await Book.countDocuments({ owner: userId, type: 'sold' });
    console.log('Marketplace purchases:', marketplacePurchases);
    console.log('Counting pending requests...');
    const pendingRequests = await Request.countDocuments({ requester: userId, status: 'pending' });
    console.log('Pending requests:', pendingRequests);
    const totalImpact = donatedBooks + sponsoredBooks + marketplacePurchases;
    console.log('Counting active donors...');
    const activeDonors = await Book.distinct('owner', { type: 'donated' });
    console.log('Active donors:', activeDonors.length);
    console.log('Fetching recent books...');
    const recentBooks = await Book.find({ owner: userId }).sort({ createdAt: -1 }).limit(3).lean();
    console.log('Recent books:', recentBooks.length);
    const recentActivity = recentBooks.map(book => ({
      type: book.type === 'donated' ? 'donation' : (book.type === 'sold' ? 'purchase' : 'other'),
      title: book.title,
      date: book.createdAt,
      status: 'completed',
      impact: book.type === 'donated' ? 'Donated to a local school' : (book.type === 'sold' ? 'Purchased from marketplace' : '')
    }));
    res.json({
      stats: {
        donatedBooks,
        sponsoredBooks,
        marketplacePurchases,
        pendingRequests,
        totalImpact,
        activeDonors: activeDonors.length
      },
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error && error.message ? error.message : JSON.stringify(error) });
  }
});

// Create a new book request
router.post('/', auth, upload.fields([
  { name: 'documents', maxCount: 3 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      title, 
      author, 
      isbn, 
      genre, 
      description,
      reason, 
      urgency,
      quantity,
      address
    } = req.body;
    
    console.log('Creating request with data:', {
      title, author, isbn, genre, description, reason, urgency, quantity, address
    });
    
    // Parse address if it's a string
    let parsedAddress = address;
    if (typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
      } catch (err) {
        console.error('Error parsing address:', err);
        return res.status(400).json({ message: 'Invalid address format' });
      }
    }
    
    // Validate required address fields
    if (!parsedAddress || !parsedAddress.street || !parsedAddress.city || 
        !parsedAddress.state || !parsedAddress.postalCode || !parsedAddress.country) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    
    const request = new Request({
      requester: req.user.id,
      book: {
        title,
        author,
        isbn,
        genre
      },
      description: description || '',
      reason,
      urgency: urgency || 'medium',
      quantity: quantity || 1,
      address: parsedAddress,
      documents: req.files?.documents ? req.files.documents.map(file => `/uploads/${file.filename}`) : [],
      coverImage: req.files?.coverImage ? `/uploads/${req.files.coverImage[0].filename}` : ''
    });

    await request.save();
    console.log('Request created successfully:', request._id);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all requests (for admin)
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('requester', 'name email')
      .sort({ priority: -1, createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single request
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name email');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request priority (admin only)
router.patch('/:id/priority', auth, async (req, res) => {
  try {
    const { priority } = req.body;
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.priority = priority;
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a book request
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Invalid urgency level'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = new Request({
      ...req.body,
      user: req.user._id
    });

    await request.save();

    // Attempt to match with available books
    const availableBook = await Book.findOne({
      status: 'available',
      type: 'donated',
      genre: request.genre,
      title: { $regex: request.title, $options: 'i' }
    }).sort({ createdAt: 1 });

    if (availableBook) {
      request.status = 'matched';
      request.matchedBook = availableBook._id;
      availableBook.status = 'reserved';
      availableBook.matchedRequest = request._id;

      await Promise.all([request.save(), availableBook.save()]);
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get user's requests
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate('matchedBook')
      .populate('sponsorship')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get all pending requests
router.get('/', auth, async (req, res) => {
  try {
    const { genre, urgency } = req.query;
    const query = { status: 'pending' };

    if (genre) query.genre = genre;
    if (urgency) query.urgency = urgency;

    const requests = await Request.find(query)
      .populate('user', 'name email location')
      .sort({ priority: -1, createdAt: 1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Match a request with a book
router.put('/:id/match', [
  auth,
  body('bookId').notEmpty().withMessage('Book ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const book = await Book.findOne({
      _id: req.body.bookId,
      status: 'available',
      type: 'donated'
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found or not available' });
    }

    request.status = 'matched';
    request.matchedBook = book._id;
    book.status = 'reserved';
    book.matchedRequest = request._id;

    await Promise.all([request.save(), book.save()]);

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error matching request' });
  }
});

// Mark request as fulfilled
router.put('/:id/fulfill', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('matchedBook');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'matched') {
      return res.status(400).json({ message: 'Request must be matched first' });
    }

    request.status = 'fulfilled';
    if (request.matchedBook) {
      request.matchedBook.status = 'fulfilled';
      await request.matchedBook.save();
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fulfilling request' });
  }
});

module.exports = router; 