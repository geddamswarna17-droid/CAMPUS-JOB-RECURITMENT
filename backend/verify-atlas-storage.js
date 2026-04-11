require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const User = require('./models/User');
const Job = require('./models/Job');

const uri = process.env.MONGODB_URI;

async function verifyStorage() {
    try {
        console.log("🔍 Checking Atlas storage capability...");
        await mongoose.connect(uri);
        
        // 1. Store a test User
        const testEmail = `atlas_verified_${Date.now()}@example.com`;
        const testUser = new User({
            name: "Atlas Storage Verified",
            email: testEmail,
            mobile: "9999999999",
            state: "Cloud",
            password: "password123"
        });
        await testUser.save();
        console.log(`✅ User stored: ${testEmail}`);

        // 2. Store a test Job
        const testJob = new Job({
            title: "Cloud Test Job",
            company: "MongoDB Atlas",
            details: "Verification persistent data",
            location: "Remote",
            type: "Full-time",
            sector: "Private",
            category: "Verification"
        });
        await testJob.save();
        console.log(`✅ Job stored: ${testJob.title}`);

        console.log("\n--------------------------------------------------");
        console.log("🎯 RESULT: Data is being stored successfully!");
        console.log("Check your Atlas UI for the 'campus-hiring' database.");
        console.log("--------------------------------------------------");

    } catch (err) {
        console.error("❌ STORAGE FAILED:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

verifyStorage();
