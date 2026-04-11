const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Fix for ECONNREFUSED with mongodb+srv on some networks/Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB via Mongoose.");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        const jobs = await mongoose.connection.db.collection('jobs').countDocuments();
        console.log("Job Count in Atlas:", jobs);
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
