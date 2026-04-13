require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dns = require("dns");

// Fix for ECONNREFUSED with mongodb+srv on some networks/Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");

const app = express();
const MONGODB_URI = "mongodb+srv://geddamswarna17_db_user:Swarna%4017@cluster0.8qn9il8.mongodb.net/campus-hiring?retryWrites=true&w=majority&appName=Cluster0";
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// ── File Upload Configuration ──
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// ── Ensure uploads directory exists ──
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

/* ---------------- EMAIL CONFIGURATION ---------------- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendStatusEmail(to, name, jobTitle, company, status) {
  const subject = status === 'Accepted' 
    ? '🎉 Congratulations! Your application has been accepted' 
    : '❌ Application Status Update';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: ${status === 'Accepted' ? '#22c55e' : '#ef4444'}; margin-bottom: 20px;">${subject}</h2>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Dear <strong>${name}</strong>,<br><br>
          Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been 
          <span style="color: ${status === 'Accepted' ? '#22c55e' : '#ef4444'}; font-weight: bold;">${status}</span>.
        </p>
        ${status === 'Accepted' ? `
        <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;">🎊 The recruiter will contact you soon with next steps!</p>
        </div>
        ` : `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">We encourage you to apply for other opportunities.</p>
        </div>
        `}
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Best regards,<br>
          <strong>CampusConnect Team</strong>
        </p>
      </div>
    </div>
  `;
  
  try {
    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
  }
}

/* ---------------- CONNECT TO MONGODB ---------------- */
const connectionOptions = {
  autoIndex: true, // Ensure indexes are built (useful for unique emails)
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

console.log("⏳ Connecting to MongoDB Atlas...");
mongoose.connect(MONGODB_URI, connectionOptions)
  .then(() => {
    console.log(`✅ ATLAS FORCED: ${mongoose.connection.host}`);
    console.log(`📂 Using Database: ${mongoose.connection.name}`);
    
    // Explicitly check for data on startup
    mongoose.connection.db.listCollections().toArray().then(cols => {
       console.log("📋 Available collections:", cols.map(c => c.name).join(", "));
    });
  })
  .catch((err) => {
    console.error("❌ MONGODB CONNECTION ERROR:", err.message);
    console.log("👉 Tip: Check if your IP is whitelisted in MongoDB Atlas Network Access.");
  });

/* ---------------- SEED DATA ---------------- */
async function seedData() {
  try {
    const count = await Job.countDocuments();
    if (count > 0) {
      console.log("✅ Jobs already exist, skipping seed.");
      return;
    }
    console.log("⏳ Seeding initial jobs...");
    
    const privateJobs = [
      { title: "Software Engineer III", company: "TechCorp Global", details: "Package: $120k–$150k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Data Scientist Intern", company: "DataSys Inc.", details: "Stipend: $4k/mo", location: "San Francisco", type: "Internship", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Product Designer", company: "Creative Solutions", details: "Package: $90k–$110k", location: "Hybrid", type: "Full-time", colorClass: "primary", sector: "Private", category: "Design" },
      { title: "Cloud Architect", company: "Nebula Systems", details: "Package: $150k–$180k", location: "Austin, TX", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Frontend Developer", company: "Google", details: "Package: $130k–$160k", location: "Mountain View, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Backend Engineer", company: "Amazon", details: "Package: $140k–$170k", location: "Seattle, WA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "UX Researcher", company: "Meta", details: "Package: $115k–$140k", location: "Menlo Park, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Design" },
      { title: "DevOps Engineer", company: "Microsoft", details: "Package: $125k–$155k", location: "Redmond, WA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Machine Learning Engineer", company: "OpenAI", details: "Package: $200k–$250k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Mobile App Developer", company: "Uber", details: "Package: $135k–$165k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Security Engineer", company: "Netflix", details: "Package: $160k–$190k", location: "Los Gatos, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Data Analyst", company: "Spotify", details: "Package: $100k–$125k", location: "New York", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Product Manager", company: "Airbnb", details: "Package: $145k–$175k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "QA Engineer", company: "Salesforce", details: "Package: $110k–$135k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Full Stack Developer", company: "Stripe", details: "Package: $150k–$180k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "AI Research Scientist", company: "DeepMind", details: "Package: $180k–$220k", location: "London", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Blockchain Developer", company: "Coinbase", details: "Package: $170k–$200k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Site Reliability Engineer", company: "LinkedIn", details: "Package: $140k–$170k", location: "Sunnyvale, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Game Developer", company: "Epic Games", details: "Package: $120k–$150k", location: "Cary, NC", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "AR/VR Engineer", company: "Apple", details: "Package: $160k–$190k", location: "Cupertino, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Database Administrator", company: "Oracle", details: "Package: $130k–$160k", location: "Austin, TX", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Embedded Systems Engineer", company: "Tesla", details: "Package: $140k–$170k", location: "Palo Alto, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Firmware Engineer", company: "Intel", details: "Package: $125k–$155k", location: "Santa Clara, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Robotics Engineer", company: "Boston Dynamics", details: "Package: $150k–$180k", location: "Waltham, MA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Bioinformatics Engineer", company: "Illumina", details: "Package: $130k–$160k", location: "San Diego, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Hardware Engineer", company: "AMD", details: "Package: $135k–$165k", location: "Sunnyvale, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Network Engineer", company: "Cisco", details: "Package: $120k–$150k", location: "San Jose, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Solutions Architect", company: "IBM", details: "Package: $155k–$185k", location: "Armonk, NY", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Technical Lead", company: "Adobe", details: "Package: $160k–$190k", location: "San Jose, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Engineering Manager", company: "Twitter", details: "Package: $180k–$220k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Principal Engineer", company: "Slack", details: "Package: $200k–$250k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Staff Engineer", company: "Zoom", details: "Package: $190k–$230k", location: "San Jose, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Data Engineer", company: "Snowflake", details: "Package: $170k–$200k", location: "Bozeman, MT", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Analytics Engineer", company: "Databricks", details: "Package: $165k–$195k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Computer Vision Engineer", company: "Waymo", details: "Package: $180k–$210k", location: "Mountain View, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "NLP Engineer", company: "Hugging Face", details: "Package: $150k–$180k", location: "New York", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Platform Engineer", company: "GitHub", details: "Package: $160k–$190k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Infrastructure Engineer", company: "Twilio", details: "Package: $155k–$185k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Release Engineer", company: "Atlassian", details: "Package: $140k–$170k", location: "Sydney", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Test Automation Engineer", company: "TestSigma", details: "Package: $110k–$140k", location: "Remote", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Build Engineer", company: "Unity", details: "Package: $135k–$165k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Performance Engineer", company: "New Relic", details: "Package: $150k–$180k", location: "Portland, OR", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Compiler Engineer", company: "LLVM", details: "Package: $175k–$205k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Kernel Engineer", company: "Red Hat", details: "Package: $160k–$190k", location: "Raleigh, NC", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Distributed Systems Engineer", company: "Confluent", details: "Package: $180k–$210k", location: "Mountain View, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "GraphQL Engineer", company: "Apollo", details: "Package: $155k–$185k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Edge Computing Engineer", company: "Fastly", details: "Package: $165k–$195k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "WebAssembly Engineer", company: "Figma", details: "Package: $170k–$200k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Rust Developer", company: "Ferrous Systems", details: "Package: $150k–$180k", location: "Berlin", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Go Developer", company: "DigitalOcean", details: "Package: $160k–$190k", location: "New York", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" }
    ];
    
    await Job.insertMany(privateJobs);
    console.log(`✅ Seeded ${privateJobs.length} private sector jobs successfully`);
  } catch (error) {
    console.error("❌ Error seeding jobs:", error.message);
  }
}

/* ---------------- RESET JOBS (Admin Only) ---------------- */
app.delete("/api/jobs/reset", async (req, res) => {
  try {
    await Job.deleteMany({});
    console.log("✅ All jobs cleared");
    
    // Re-seed with new jobs
    const initialJobs = [
      // ========== PRIVATE SECTOR JOBS (50 Jobs) ==========
      { title: "Software Engineer III", company: "TechCorp Global", details: "Package: $120k–$150k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Data Scientist Intern", company: "DataSys Inc.", details: "Stipend: $4k/mo", location: "San Francisco", type: "Internship", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Product Designer", company: "Creative Solutions", details: "Package: $90k–$110k", location: "Hybrid", type: "Full-time", colorClass: "primary", sector: "Private", category: "Design" },
      { title: "Cloud Architect", company: "Nebula Systems", details: "Package: $150k–$180k", location: "Austin, TX", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Frontend Developer", company: "Google", details: "Package: $130k–$160k", location: "Mountain View, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Backend Engineer", company: "Amazon", details: "Package: $140k–$170k", location: "Seattle, WA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "UX Researcher", company: "Meta", details: "Package: $115k–$140k", location: "Menlo Park, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Design" },
      { title: "DevOps Engineer", company: "Microsoft", details: "Package: $125k–$155k", location: "Redmond, WA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Machine Learning Engineer", company: "OpenAI", details: "Package: $200k–$250k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Mobile App Developer", company: "Uber", details: "Package: $135k–$165k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Security Engineer", company: "Netflix", details: "Package: $160k–$190k", location: "Los Gatos, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Data Analyst", company: "Spotify", details: "Package: $100k–$125k", location: "New York", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Product Manager", company: "Airbnb", details: "Package: $145k–$175k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "QA Engineer", company: "Salesforce", details: "Package: $110k–$135k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Full Stack Developer", company: "Stripe", details: "Package: $150k–$180k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "AI Research Scientist", company: "DeepMind", details: "Package: $180k–$220k", location: "London", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Blockchain Developer", company: "Coinbase", details: "Package: $170k–$200k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Site Reliability Engineer", company: "LinkedIn", details: "Package: $140k–$170k", location: "Sunnyvale, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Game Developer", company: "Epic Games", details: "Package: $120k–$150k", location: "Cary, NC", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "AR/VR Engineer", company: "Apple", details: "Package: $160k–$190k", location: "Cupertino, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Database Administrator", company: "Oracle", details: "Package: $130k–$160k", location: "Austin, TX", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Embedded Systems Engineer", company: "Tesla", details: "Package: $140k–$170k", location: "Palo Alto, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Firmware Engineer", company: "Intel", details: "Package: $125k–$155k", location: "Santa Clara, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Robotics Engineer", company: "Boston Dynamics", details: "Package: $150k–$180k", location: "Waltham, MA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Bioinformatics Engineer", company: "Illumina", details: "Package: $130k–$160k", location: "San Diego, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Hardware Engineer", company: "AMD", details: "Package: $135k–$165k", location: "Sunnyvale, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Network Engineer", company: "Cisco", details: "Package: $120k–$150k", location: "San Jose, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Solutions Architect", company: "IBM", details: "Package: $155k–$185k", location: "Armonk, NY", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Technical Lead", company: "Adobe", details: "Package: $160k–$190k", location: "San Jose, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Engineering Manager", company: "Twitter", details: "Package: $180k–$220k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Principal Engineer", company: "Slack", details: "Package: $200k–$250k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Staff Engineer", company: "Zoom", details: "Package: $190k–$230k", location: "San Jose, CA", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Data Engineer", company: "Snowflake", details: "Package: $170k–$200k", location: "Bozeman, MT", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Analytics Engineer", company: "Databricks", details: "Package: $165k–$195k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Computer Vision Engineer", company: "Waymo", details: "Package: $180k–$210k", location: "Mountain View, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "NLP Engineer", company: "Hugging Face", details: "Package: $150k–$180k", location: "New York", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Platform Engineer", company: "GitHub", details: "Package: $160k–$190k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Infrastructure Engineer", company: "Twilio", details: "Package: $155k–$185k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Release Engineer", company: "Atlassian", details: "Package: $140k–$170k", location: "Sydney", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Test Automation Engineer", company: "TestSigma", details: "Package: $110k–$140k", location: "Remote", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Build Engineer", company: "Unity", details: "Package: $135k–$165k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Performance Engineer", company: "New Relic", details: "Package: $150k–$180k", location: "Portland, OR", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Compiler Engineer", company: "LLVM", details: "Package: $175k–$205k", location: "Remote", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Kernel Engineer", company: "Red Hat", details: "Package: $160k–$190k", location: "Raleigh, NC", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Distributed Systems Engineer", company: "Confluent", details: "Package: $180k–$210k", location: "Mountain View, CA", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "GraphQL Engineer", company: "Apollo", details: "Package: $155k–$185k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Edge Computing Engineer", company: "Fastly", details: "Package: $165k–$195k", location: "San Francisco", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "WebAssembly Engineer", company: "Figma", details: "Package: $170k–$200k", location: "San Francisco", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      { title: "Rust Developer", company: "Ferrous Systems", details: "Package: $150k–$180k", location: "Berlin", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
      { title: "Go Developer", company: "DigitalOcean", details: "Package: $160k–$190k", location: "New York", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
      
      // ========== GOVERNMENT SECTOR JOBS (50 Jobs) ==========
      { title: "Junior Engineer", company: "Indian Railways", details: "Salary: ₹45k–₹60k/month", location: "Multiple Locations", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Scientific Officer", company: "BARC", details: "Salary: ₹56k–₹80k/month", location: "Mumbai", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Junior Research Fellow", company: "ISRO", details: "Stipend: ₹31k–₹35k/month", location: "Bangalore", type: "Internship", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Assistant Professor", company: "IIT Delhi", details: "Salary: ₹70k–₹90k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Technical Assistant", company: "DRDO", details: "Salary: ₹35k–₹50k/month", location: "Hyderabad", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Graduate Engineer Trainee", company: "NTPC", details: "Salary: ₹50k–₹70k/month", location: "Multiple Locations", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Junior Executive", company: "Airport Authority", details: "Salary: ₹40k–₹55k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Scientist B", company: "CSIR", details: "Salary: ₹60k–₹85k/month", location: "Pune", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Assistant Engineer", company: "State Electricity Board", details: "Salary: ₹45k–₹65k/month", location: "Statewide", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Junior System Analyst", company: "NIC", details: "Salary: ₹50k–₹70k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Technical Officer", company: "NIELIT", details: "Salary: ₹55k–₹75k/month", location: "Multiple", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Project Associate", company: "CDAC", details: "Salary: ₹30k–₹45k/month", location: "Pune", type: "Contract", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Junior Programmer", company: "ESIC", details: "Salary: ₹35k–₹50k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "IT Officer", company: "Public Sector Bank", details: "Salary: ₹45k–₹65k/month", location: "All India", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Network Administrator", company: "BSNL", details: "Salary: ₹40k–₹60k/month", location: "Statewide", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Cyber Security Analyst", company: "Ministry of Defence", details: "Salary: ₹55k–₹80k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Software Developer", company: "UIDAI (Aadhaar)", details: "Salary: ₹50k–₹70k/month", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Data Entry Operator", company: "SSC", details: "Salary: ₹25k–₹35k/month", location: "All India", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Senior System Analyst", company: "Income Tax Dept", details: "Salary: ₹60k–₹80k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Web Developer", company: "National Informatics Centre", details: "Salary: ₹45k–₹65k/month", location: "Multiple", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Database Manager", company: "Election Commission", details: "Salary: ₹55k–₹75k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "IT Consultant", company: "NITI Aayog", details: "Salary: ₹70k–₹90k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "E-Governance Specialist", company: "Digital India", details: "Salary: ₹50k–₹70k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Smart City Engineer", company: "Ministry of Urban Development", details: "Salary: ₹55k–₹75k/month", location: "Multiple", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Research Scientist", company: "IISc Bangalore", details: "Salary: ₹65k–₹85k/month", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Technical Director", company: "Doordarshan", details: "Salary: ₹70k–₹95k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Broadcast Engineer", company: "Prasar Bharati", details: "Salary: ₹50k–₹70k/month", location: "Multiple", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Satellite Engineer", company: "INSAT", details: "Salary: ₹60k–₹85k/month", location: "Ahmedabad", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Spacecraft Engineer", company: "ISRO VSSC", details: "Salary: ₹55k–₹80k/month", location: "Thiruvananthapuram", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Rocket Propulsion Engineer", company: "ISRO LPSC", details: "Salary: ₹60k–₹85k/month", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Atomic Energy Engineer", company: "NPCIL", details: "Salary: ₹65k–₹90k/month", location: "Mumbai", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Naval Architect", company: "Indian Navy", details: "Salary: ₹60k–₹85k/month", location: "Goa", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Aerospace Engineer", company: "ADA", details: "Salary: ₹55k–₹80k/month", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Meteorological Engineer", company: "IMD", details: "Salary: ₹45k–₹65k/month", location: "Pune", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Survey Engineer", company: "Survey of India", details: "Salary: ₹40k–₹60k/month", location: "Dehradun", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Geospatial Analyst", company: "NRSC", details: "Salary: ₹50k–₹70k/month", location: "Hyderabad", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Oceanographer", company: "NIO", details: "Salary: ₹55k–₹75k/month", location: "Goa", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Seismologist", company: "NGRI", details: "Salary: ₹60k–₹80k/month", location: "Hyderabad", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Climate Data Analyst", company: "IITM", details: "Salary: ₹50k–₹70k/month", location: "Pune", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Water Resources Engineer", company: "CWC", details: "Salary: ₹55k–₹75k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Highway Engineer", company: "NHAI", details: "Salary: ₹50k–₹70k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Port Engineer", company: "JNPT", details: "Salary: ₹55k–₹80k/month", location: "Mumbai", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Metro Rail Engineer", company: "DMRC", details: "Salary: ₹60k–₹85k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Defense Production Engineer", company: "Ordnance Factory", details: "Salary: ₹45k–₹65k/month", location: "Multiple", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Signal Engineer", company: "Indian Army", details: "Salary: ₹50k–₹75k/month", location: "Multiple", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Telecom Engineer", company: "ITI", details: "Salary: ₹40k–₹60k/month", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Optical Fiber Engineer", company: "Bharat Broadband", details: "Salary: ₹45k–₹65k/month", location: "All India", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Power Plant Engineer", company: "Power Grid", details: "Salary: ₹55k–₹80k/month", location: "Gurgaon", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Renewable Energy Engineer", company: "SECI", details: "Salary: ₹50k–₹75k/month", location: "Delhi", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Coal Mining Engineer", company: "Coal India", details: "Salary: ₹60k–₹85k/month", location: "Kolkata", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Petroleum Engineer", company: "ONGC", details: "Salary: ₹65k–₹90k/month", location: "Dehradun", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Natural Gas Engineer", company: "GAIL", details: "Salary: ₹55k–₹80k/month", location: "Noida", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" },
      { title: "Steel Plant Engineer", company: "SAIL", details: "Salary: ₹50k–₹75k/month", location: "Bokaro", type: "Full-time", colorClass: "primary", sector: "Government", category: "Engineering" },
      { title: "Cement Corporation Engineer", company: "CCI", details: "Salary: ₹45k–₹65k/month", location: "Delhi", type: "Full-time", colorClass: "accent", sector: "Government", category: "Engineering" }
    ];
    
    await Job.insertMany(initialJobs);
    res.json({ message: `✅ Jobs reset successful - ${initialJobs.length} jobs added`, count: initialJobs.length });
  } catch (error) {
    res.status(500).json({ message: "Error resetting jobs", error: error.message });
  }
});

/* ---------------- STATS ---------------- */
app.get('/api/stats', async (req, res) => {
  try {
    const jobCount = await Job.countDocuments();
    res.json({
      companies: 500,
      studentsPlaced: 10000,
      successRate: 98,
      activeJobs: jobCount
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

/* ---------------- JOBS ---------------- */
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

app.post('/api/jobs/add', async (req, res) => {
  try {
    const { title, company, details, location, type, colorClass, deadline, category, sector } = req.body;
    console.log(`🆕 ADDING JOB: ${title} at ${company}`);
    const newJob = new Job({ title, company, details, location, type, colorClass, deadline, category, sector });
    await newJob.save();
    console.log(`✅ SUCCESS: Job stored in Atlas: ${title}`);
    res.status(201).json({ message: "Job added", job: newJob });
  } catch (error) {
    console.error("❌ FAILED: Error adding job:", error.message);
    res.status(500).json({ message: "Error adding job" });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: "Error updating job" });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job" });
  }
});

/* ---------------- REGISTER ---------------- */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, mobile, state, password } = req.body;
    console.log(`🆕 NEW REGISTRATION ATTEMPT: ${email}`);
    
    if (!name || !email || !mobile || !state || !password) {
      console.log("⚠️ Registration blocked: Missing fields");
      return res.status(400).json({ message: "All fields required" });
    }
    
    if (!/^\d{10}$/.test(mobile)) {
      console.log(`⚠️ Registration blocked: Invalid mobile format (${mobile})`);
      return res.status(400).json({ message: "Invalid mobile number. Please enter a 10-digit number." });
    }
    
    const exists = await User.findOne({ email });
    if (exists) {
      console.log(`⚠️ Registration blocked: User already exists (${email})`);
      return res.status(409).json({ message: "User already exists" });
    }
    
    const newUser = new User({ name, email, mobile, state, password });
    await newUser.save();
    
    console.log(`✅ SUCCESS: New user stored in Atlas: ${email}`);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("❌ FAILED: Error during registration:", error.message);
    res.status(500).json({ message: "Error during registration" });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Admin login */
    if (email === "swarna@gmail.com" && password === "swarna@123") {
      return res.json({
        role: "admin",
        message: "Admin login successful"
      });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      role: "user",
      email: user.email,
      name: user.name,
      mobile: user.mobile,
      state: user.state,
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login" });
  }
});

/* ---------------- APPLY JOB WITH FILE UPLOAD ---------------- */
app.post("/api/apply", upload.single('resume'), async (req, res) => {
  try {
    const { name, email, mobile, state, education, experience, skills, jobTitle, company } = req.body;
    console.log(`🆕 APPLICATION RECEIVED: ${name} for ${jobTitle}`);

    if (mobile && !/^\d{10}$/.test(mobile)) {
      console.log(`⚠️ Blocked: Invalid mobile format (${mobile})`);
      return res.status(400).json({ message: "Invalid phone number. Please enter a 10-digit number." });
    }
    
    const resumePath = req.file ? req.file.filename : '';
    const resumeName = req.file ? req.file.originalname : 'Not Provided';
    
    const application = new Application({
      name, email, mobile, state, education, experience, skills,
      jobTitle, company,
      status: "Under Review",
      theme: "neutral",
      resumeName: resumeName,
      resumePath: resumePath
    });
    await application.save();
    console.log(`✅ SUCCESS: Application stored in Atlas for ${email}`);
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("❌ FAILED: Error submitting application:", error.message);
    res.status(500).json({ message: "Error submitting application" });
  }
});

/* ---------------- GET APPLICATIONS ---------------- */
app.get("/api/status", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

/* ---------------- GET APPLICATION DETAILS ---------------- */
app.get("/api/applications/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Error fetching application details" });
  }
});

/* ---------------- GET USER DETAILS ---------------- */
app.get("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's applications
    const applications = await Application.find({ email: req.params.email }).sort({ createdAt: -1 });
    
    res.json({
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        state: user.state
      },
      applications: applications
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
});

/* ---------------- DOWNLOAD RESUME ---------------- */
app.get("/api/resume/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume file not found" });
    }
    
    // Get file extension and set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // For text files, return as HTML for easy viewing
    if (ext === '.txt') {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${filename}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
    .resume-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    pre { white-space: pre-wrap; font-family: 'Courier New', monospace; line-height: 1.6; font-size: 14px; }
    h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .download-btn { 
      position: fixed; top: 20px; right: 20px; 
      background: #007bff; color: white; 
      padding: 10px 20px; border-radius: 5px; 
      text-decoration: none; cursor: pointer;
    }
    .download-btn:hover { background: #0056b3; }
  </style>
</head>
<body>
  <a href="/api/resume/${filename}/download" class="download-btn">Download Resume</a>
  <div class="resume-container">
    <h2>${filename.replace('.txt', '').toUpperCase()}</h2>
    <pre>${fileContent}</pre>
  </div>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } else {
      // For other files, stream with proper content type
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(500).json({ message: "Error serving resume file" });
      });
    }
    
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ message: "Error downloading resume" });
  }
});

// Download endpoint for text files
app.get("/api/resume/:filename/download", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume file not found" });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ message: "Error downloading resume" });
  }
});

/* ---------------- UPDATE APPLICATION STATUS ---------------- */
app.put("/api/applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Accepted', 'Rejected', 'Under Review'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    const application = await Application.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Send email notification
    await sendStatusEmail(application.email, application.name, application.jobTitle, application.company, status);
    
    res.json({ message: `Application ${status.toLowerCase()} successfully`, application });
  } catch (error) {
    res.status(500).json({ message: "Error updating application status" });
  }
});

/* ---------------- SEARCH JOBS ---------------- */
app.get("/api/jobs/search", async (req, res) => {
  try {
    const { q, type, category } = req.query;
    const now = new Date();
    
    let query = { deadline: { $gte: now } }; // Only show non-expired jobs
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error searching jobs" });
  }
});

/* ---------------- BOOKMARKS ---------------- */
app.get("/api/bookmarks/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.json([]);
    res.json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookmarks" });
  }
});

app.post("/api/bookmarks/:email", async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (!user.bookmarks) user.bookmarks = [];
    if (!user.bookmarks.includes(jobId)) {
      user.bookmarks.push(jobId);
      await user.save();
    }
    res.json({ message: "Bookmark added", bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: "Error adding bookmark" });
  }
});

app.delete("/api/bookmarks/:email/:jobId", async (req, res) => {
  try {
    const { email, jobId } = req.params;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.bookmarks) {
      user.bookmarks = user.bookmarks.filter(id => id !== jobId);
      await user.save();
    }
    res.json({ message: "Bookmark removed", bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: "Error removing bookmark" });
  }
});

// Handle any other requests by sending back the index.html
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 SERVER ACTIVE: http://localhost:${PORT}`);
  console.log(`🌍 DESTINATION: MongoDB Atlas (Cluster0)`);
});