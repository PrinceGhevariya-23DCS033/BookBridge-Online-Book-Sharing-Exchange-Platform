const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookbridge')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/sponsor', require('./routes/sponsor.routes'));
app.use('/api/marketplace', require('./routes/marketplace.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/donations', require('./routes/donation.routes'));
app.use('/api/cart', require('./routes/cart.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      details: err.message
    });
  }

  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.error('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 