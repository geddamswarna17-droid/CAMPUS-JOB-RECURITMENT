require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to:', mongoose.connection.host);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (let col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`Collection: ${col.name} | Count: ${count}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
