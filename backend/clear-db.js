require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");

const MONGODB_URI = process.env.MONGODB_URI;

async function clearDatabase() {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB.");

        // Clear Collections
        console.log("⏳ Clearing collections...");
        await Promise.all([
            User.deleteMany({}),
            Job.deleteMany({}),
            Application.deleteMany({})
        ]);
        console.log("✅ All collections cleared (Users, Jobs, Applications).");

        // Clear Uploads Directory
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            console.log("⏳ Clearing uploads directory...");
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                } else if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                }
            }
            console.log("✅ Uploads directory cleared.");
        }

        console.log("\n✨ Database and uploads have been successfully reset!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    }
}

clearDatabase();
