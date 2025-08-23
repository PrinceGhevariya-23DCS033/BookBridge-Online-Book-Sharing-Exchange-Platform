const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: true
  },
  type: {
    type: String,
    enum: ['donated', 'sold', 'new'],
    required: true
  },
  category: {
    type: String,
    enum: ['free', 'donated', 'sale', 'rent'],
    default: function() {
      if (this.type === 'donated') return 'free';
      if (this.type === 'sold') return 'sale';
      return 'sale';
    }
  },
  image: {
    type: String,
    default: 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image',
    set: function(v) {
      if (!v) {
        return 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image';
      }
      // If the image URL is from Google Books, ensure it's using HTTPS
      if (v.includes('books.google.com')) {
        return v.replace('http://', 'https://');
      }
      return v;
    }
  },
  isbn: {
    type: String,
    trim: true
  },
  googleBooksId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerContact: {
    email: {
      type: String,
      required: function() {
        return this.type === 'sold';
      },
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'fulfilled'],
    default: 'available'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  marketplaceStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  price: {
    type: Number,
    default: function() {
      if (this.type === 'sold') return 19.99;
      if (this.type === 'new') return 24.99;
      return 0;
    },
    required: function() {
      return this.type === 'sold';
    }
  },
  matchedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  }
}, {
  timestamps: true
});

// Index for efficient querying
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
bookSchema.index({ googleBooksId: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 