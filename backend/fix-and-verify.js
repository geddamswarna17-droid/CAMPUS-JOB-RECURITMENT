require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

async function fixAndVerify() {
    try {
        console.log("🚀 Starting Fix & Verify Process...");
        await mongoose.connect(uri);
        console.log(`✅ Connected to Atlas: ${mongoose.connection.name}`);

        // 1. Check current counts
        const User = require('./models/User');
        const count = await User.countDocuments();
        console.log(`📊 Current User Count in Atlas: ${count}`);

        // 2. Perform a "Pulse Write" (Store a dummy record to verify writes)
        const pulseEmail = `connection_check_${Date.now()}@atlas.com`;
        const pulseUser = new User({
            name: "Atlas Verification User",
            email: pulseEmail,
            mobile: "0000000000",
            state: "Verified",
            password: "verified_pw"
        });

        await pulseUser.save();
        console.log(`✨ Successfully stored verification data: ${pulseEmail}`);

        // 3. Verify it exists
        const verified = await User.findOne({ email: pulseEmail });
        if (verified) {
            console.log("🎯 RECTIFIED: Data is definitely storing in MongoDB Atlas!");
            await User.deleteOne({ email: pulseEmail });
            console.log("🧹 Cleanup complete.");
        } else {
            console.error("❌ ERROR: Data was saved but could not be retrieved immediately.");
        }

    } catch (err) {
        console.error("❌ RECTIFICATION FAILED:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

fixAndVerify();
