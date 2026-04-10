const mongoose = require('mongoose');
require('dotenv').config();

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
