const mongoose = require('mongoose');
const Book = require('./models/book.model');
require('dotenv').config();

async function checkAllBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const allBooks = await Book.find({}).populate('owner', 'name email').sort({ createdAt: -1 });
    
    console.log(`\n=== ALL ${allBooks.length} BOOKS ===`);
    allBooks.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}" by ${book.author}`);
      console.log(`   Type: ${book.type} | Category: ${book.category} | Status: ${book.status} | Price: ${book.price}`);
      console.log(`   MarketplaceStatus: ${book.marketplaceStatus} | Owner: ${book.owner?.name}\n`);
    });
    
    const donatedBooks = allBooks.filter(book => book.type === 'donated');
    const soldBooks = allBooks.filter(book => book.type === 'sold');
    const otherBooks = allBooks.filter(book => book.type !== 'donated' && book.type !== 'sold');
    
    console.log(`📊 SUMMARY:`);
    console.log(`   Donated books: ${donatedBooks.length}`);
    console.log(`   Sold books: ${soldBooks.length}`);
    console.log(`   Other books: ${otherBooks.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

checkAllBooks();
