require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const User = require('./models/User');

const uri = process.env.MONGODB_URI;

async function listRecent() {
    try {
        await mongoose.connect(uri);
        console.log(`📋 Fetching 5 Most Recent Users from Atlas [DB: ${mongoose.connection.name}]...\n`);

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

        if (recentUsers.length === 0) {
            console.log("📭 No users found in the database.");
        } else {
            recentUsers.forEach((u, i) => {
                const date = u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A';
                console.log(`${i+1}. Name: ${u.name} | Email: ${u.email} | Date: ${date}`);
            });
        }
    } catch (err) {
        console.error("❌ Error listing users:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

listRecent();
