const mongoose = require('mongoose');
const Book = require('./models/book.model');
const Donation = require('./models/donation.model');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookbridge';
console.log('Connecting to:', MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas (cloud)' : 'Local MongoDB');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Check both books and donations
    const allBooks = await Book.find({}).populate('owner', 'name email').sort({ createdAt: -1 });
    console.log('Total books:', allBooks.length);
    
    const allDonations = await Donation.find({}).populate('donor', 'name email').populate('book', 'title author status').sort({ createdAt: -1 });
    console.log('Total donations:', allDonations.length);
    
    console.log('\n=== All Books ===');
    allBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - Type: ${book.type} - Status: ${book.status} - MarketplaceStatus: ${book.marketplaceStatus} - Owner: ${book.owner?.name}`);
    });
    
    console.log('\n=== All Donations ===');
    allDonations.forEach((donation, index) => {
      console.log(`${index + 1}. Book: ${donation.book?.title} - Book Status: ${donation.book?.status} - Donation Status: ${donation.status} - Donor: ${donation.donor?.name}`);
    });
    
    // Check marketplace eligible books
    const marketplaceBooks = await Book.find({
      type: { $in: ['sold', 'donated'] },
      status: 'available',
      marketplaceStatus: 'active'
    }).populate('owner', 'name email');
    console.log('\n=== Marketplace Eligible Books ===');
    console.log('Total marketplace books:', marketplaceBooks.length);
    marketplaceBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - Type: ${book.type} - Status: ${book.status} - Owner: ${book.owner?.name}`);
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });
