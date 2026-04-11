require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

async function debugDatabases() {
    try {
        await mongoose.connect(uri);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        
        console.log("📍 Connected to Atlas Cluster.");
        console.log("📂 Current Active DB:", mongoose.connection.name);
        console.log("\n📊 All Databases in this cluster:");
        dbs.databases.forEach(db => {
            console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });

        console.log("\n🧪 Search Evidence:");
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (let col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name} | Count: ${count}`);
            if (count > 0) {
                const recent = await mongoose.connection.db.collection(col.name).find().sort({_id:-1}).limit(1).toArray();
                console.log(`   Latest ID stored: ${recent[0]._id} (created at: ${recent[0].createdAt || 'N/A'})`);
            }
        }

    } catch (err) {
        console.error("❌ Debug Error:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

debugDatabases();
