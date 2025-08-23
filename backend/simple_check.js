const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookbridge';
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const databasesList = await admin.listDatabases();
    console.log('\nAll databases:');
    databasesList.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in current database:', collections.map(c => c.name));
    
    // Try to connect to different possible database names
    const possibleDatabases = ['bookbridge', 'test', 'main'];
    
    for (const dbName of possibleDatabases) {
      console.log(`\n=== Checking database: ${dbName} ===`);
      const db = mongoose.connection.client.db(dbName);
      
      try {
        const booksCollection = db.collection('books');
        const books = await booksCollection.find({}).limit(5).toArray();
        console.log(`Books in ${dbName}:`, books.length);
        
        const donationsCollection = db.collection('donations');
        const donations = await donationsCollection.find({}).limit(5).toArray();
        console.log(`Donations in ${dbName}:`, donations.length);
        
        if (books.length > 0) {
          console.log('Sample books:');
          books.forEach((book, index) => {
            console.log(`  ${index + 1}. ${book.title} - Type: ${book.type} - Status: ${book.status}`);
          });
        }
        
        if (donations.length > 0) {
          console.log('Sample donations:');
          donations.forEach((donation, index) => {
            console.log(`  ${index + 1}. Book ID: ${donation.book} - Status: ${donation.status}`);
          });
        }
      } catch (err) {
        console.log(`Error checking ${dbName}:`, err.message);
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

checkDatabase();
