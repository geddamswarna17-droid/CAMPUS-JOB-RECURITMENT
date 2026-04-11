require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const User = require('./models/User');
const uri = process.env.MONGODB_URI;

async function forceWrite() {
    try {
        console.log("🚀 FORCING ATLAS WRITE...");
        await mongoose.connect(uri);
        
        console.log(`🔗 CONNECTED TO: ${mongoose.connection.host}`);
        console.log(`📂 DATABASE: ${mongoose.connection.name}`);

        const testEmail = `atlas_force_${Date.now()}@test.com`;
        const newUser = new User({
            name: "Forced Atlas User",
            email: testEmail,
            mobile: "1111111111",
            state: "Atlas",
            password: "password123"
        });

        await newUser.save();
        console.log("\n✅ SUCCESS!");
        console.log(`📝 Record saved with Email: ${testEmail}`);
        
        const count = await User.countDocuments();
        console.log(`📊 NEW TOTAL USER COUNT: ${count}`);
        
        console.log("\n👉 If the count above is 8, then it is working correctly.");
        console.log("👉 If you still don't see it in Atlas UI, REFRESH the Atlas page or check the DB name 'campus-hiring'.");

    } catch (err) {
        console.error("❌ FAILED:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

forceWrite();
