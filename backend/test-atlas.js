require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Fix for ECONNREFUSED with mongodb+srv on some networks/Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

console.log('Attempting to connect to:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Check for some data
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });
