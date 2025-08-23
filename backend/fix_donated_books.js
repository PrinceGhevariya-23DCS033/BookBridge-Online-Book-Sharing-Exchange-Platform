const mongoose = require('mongoose');
const Book = require('./models/book.model');
const Donation = require('./models/donation.model');
require('dotenv').config();

async function fixDonatedBooks() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookbridge';
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');
    
    console.log('=== FIXING EXISTING DONATED BOOKS ===');
    
    // Get all donations
    const donations = await Donation.find({}).populate('book');
    console.log('Found donations:', donations.length);
    
    let updatedCount = 0;
    
    for (const donation of donations) {
      if (donation.book) {
        const result = await Book.findByIdAndUpdate(donation.book._id, {
          status: 'available',
          type: 'donated',
          category: 'free',
          isAvailable: true,
          marketplaceStatus: 'active',
          price: 0
        }, { new: true });
        
        if (result) {
          console.log(`✓ Updated book: ${donation.book.title} - Now available in marketplace`);
          updatedCount++;
        } else {
          console.log(`✗ Failed to update book: ${donation.book.title}`);
        }
      } else {
        console.log(`⚠ Donation ${donation._id} has no associated book`);
      }
    }
    
    console.log(`\n🎉 COMPLETED: Fixed ${updatedCount} donated books for marketplace`);
    
    // Verify the fix
    const marketplaceBooks = await Book.find({
      type: 'donated',
      status: 'available',
      marketplaceStatus: 'active'
    });
    
    console.log(`\n📚 Marketplace now has ${marketplaceBooks.length} donated books:`);
    marketplaceBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - ${book.author} (${book.category})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

fixDonatedBooks();
