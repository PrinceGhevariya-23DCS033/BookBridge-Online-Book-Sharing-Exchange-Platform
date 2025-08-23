const mongoose = require('mongoose');
const Book = require('./models/book.model');
const User = require('./models/user.model');
require('dotenv').config();

async function checkMarketplaceBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Check the exact marketplace query
    const marketplaceQuery = {
      type: { $in: ['sold', 'donated'] },
      status: 'available',
      marketplaceStatus: 'active'
    };
    
    console.log('Marketplace query:', marketplaceQuery);
    
    const marketplaceBooks = await Book.find(marketplaceQuery).populate('owner', 'name email');
    console.log('\n=== MARKETPLACE BOOKS (what API returns) ===');
    console.log('Total:', marketplaceBooks.length);
    
    marketplaceBooks.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}" by ${book.author}`);
      console.log(`   - Type: ${book.type}`);
      console.log(`   - Category: ${book.category}`);
      console.log(`   - Status: ${book.status}`);
      console.log(`   - MarketplaceStatus: ${book.marketplaceStatus}`);
      console.log(`   - Price: ${book.price}`);
      console.log(`   - Owner: ${book.owner?.name || 'No owner'}`);
      console.log('   ---');
    });
    
    // Check all donated books specifically
    const allDonatedBooks = await Book.find({ type: 'donated' });
    console.log('\n=== ALL DONATED BOOKS (regardless of status) ===');
    console.log('Total:', allDonatedBooks.length);
    
    allDonatedBooks.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}" - Status: ${book.status} - MarketplaceStatus: ${book.marketplaceStatus}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

checkMarketplaceBooks();
