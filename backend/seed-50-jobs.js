require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");

const MONGODB_URI = process.env.MONGODB_URI;

const jobList = [
    { title: "Software Engineer", company: "TCS", details: "Package: ₹4L - ₹8L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Systems Engineer Trainee", company: "Infosys", details: "Package: ₹3.6L - ₹6L", location: "Mysore", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Project Engineer", company: "Wipro", details: "Package: ₹3.5L - ₹7L", location: "Chennai", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Software Analyst", company: "HCL Technologies", details: "Package: ₹4L - ₹9L", location: "Noida", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Programmer Analyst", company: "Cognizant", details: "Package: ₹4L - ₹8.5L", location: "Hyderabad", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Graduate Engineer Trainee", company: "Tech Mahindra", details: "Package: ₹3.2L - ₹5.5L", location: "Pune", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Application Developer", company: "Accenture", details: "Package: ₹4.5L - ₹10L", location: "Mumbai", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Software Engineer", company: "Capgemini", details: "Package: ₹3.8L - ₹8L", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Data Analyst", company: "Genpact", details: "Package: ₹3L - ₹6.5L", location: "Gurgaon", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Cloud Support Associate", company: "Oracle India", details: "Package: ₹6L - ₹12L", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Associate Software Engineer", company: "IBM India", details: "Package: ₹5L - ₹11L", location: "Kolkata", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Systems Analyst", company: "Deloitte", details: "Package: ₹6L - ₹15L", location: "Hyderabad", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Software Engineer", company: "LTI Mindtree", details: "Package: ₹4L - ₹10L", location: "Mumbai", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Backend Developer", company: "Zoho", details: "Package: ₹6L - ₹18L", location: "Chennai", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Frontend Developer", company: "Freshworks", details: "Package: ₹7L - ₹20L", location: "Chennai", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Full Stack Engineer", company: "Persistent Systems", details: "Package: ₹5L - ₹12L", location: "Pune", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Network Administrator", company: "Mphasis", details: "Package: ₹3.5L - ₹7.5L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Software Developer", company: "Hexaware", details: "Package: ₹4L - ₹9L", location: "Chennai", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Quality Assurance Engineer", company: "Zensar", details: "Package: ₹3L - ₹6L", location: "Pune", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Cybersecurity Analyst", company: "Coforge", details: "Package: ₹4.5L - ₹9.5L", location: "Greater Noida", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Embedded Systems Engineer", company: "Cyient", details: "Package: ₹4L - ₹8L", location: "Hyderabad", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Cloud Engineer", company: "Virtusa", details: "Package: ₹4L - ₹9.5L", location: "Chennai", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "App Developer", company: "Kpit", details: "Package: ₹4L - ₹8L", location: "Pune", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "UI Designer", company: "Tata Elxsi", details: "Package: ₹4L - ₹10L", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Private", category: "Design" },
    { title: "Data Engineer", company: "Exl Service", details: "Package: ₹5L - ₹13L", location: "Gurgaon", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Software Engineer", company: "Honeywell India", details: "Package: ₹8L - ₹16L", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Backend Engineer", company: "Samsung India", details: "Package: ₹10L - ₹25L", location: "Noida", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Software Developer", company: "Microsoft India", details: "Package: ₹15L - ₹45L", location: "Hyderabad", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Frontend Lead", company: "Google India", details: "Package: ₹20L - ₹60L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Full Stack Developer", company: "Amazon India", details: "Package: ₹18L - ₹50L", location: "Bangalore", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Software Engineer", company: "TCS", details: "Package: ₹5L - ₹9L", location: "Kolkata", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Process Associate", company: "Infosys BPM", details: "Package: ₹2.5L - ₹4.5L", location: "Jaipur", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Infra Engineer", company: "Wipro", details: "Package: ₹4L - ₹8.5L", location: "Pune", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Python Developer", company: "HCL Technologies", details: "Package: ₹6L - ₹14L", location: "Lucknow", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Java Backend Developer", company: "Cognizant", details: "Package: ₹5L - ₹11L", location: "Kochi", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Mobile Engineer", company: "Tech Mahindra", details: "Package: ₹5L - ₹10.5L", location: "Nagpur", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Business Analyst", company: "Accenture", details: "Package: ₹7L - ₹18L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Project Manager", company: "Capgemini", details: "Package: ₹15L - ₹35L", location: "Mumbai", type: "Full-time", colorClass: "accent", sector: "Private", category: "Management" },
    { title: "Cloud Architect", company: "LTI Mindtree", details: "Package: ₹20L - ₹45L", location: "Chennai", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Software Engineer", company: "Zoho", details: "Package: ₹7L - ₹15L", location: "Remote", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "SRE Engineer", company: "Flipkart", details: "Package: ₹18L - ₹40L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "DevOps Engineer", company: "Jio", details: "Package: ₹10L - ₹25L", location: "Navi Mumbai", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Software Specialist", company: "Airtel", details: "Package: ₹8L - ₹20L", location: "Gurgaon", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Frontend Developer", company: "Paytm", details: "Package: ₹12L - ₹28L", location: "Noida", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Mobile Dev", company: "Swiggy", details: "Package: ₹15L - ₹35L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Product Analyst", company: "Zomato", details: "Package: ₹12L - ₹30L", location: "Gurgaon", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Backend Specialist", company: "Cisco India", details: "Package: ₹20L - ₹50L", location: "Bangalore", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Platform Engineer", company: "Salesforce India", details: "Package: ₹25L - ₹65L", location: "Hyderabad", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" },
    { title: "Software Engineer", company: "Publicis Sapient", details: "Package: ₹8L - ₹20L", location: "Gurgaon", type: "Full-time", colorClass: "primary", sector: "Private", category: "Engineering" },
    { title: "Associate Engineer", company: "TCS", details: "Package: ₹3.6L - ₹7L", location: "Mumbai", type: "Full-time", colorClass: "accent", sector: "Private", category: "Engineering" }
];

async function seedJobs() {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected.");

        // First clear existing jobs so we don't duplicate
        console.log("⏳ Clearing existing jobs...");
        await Job.deleteMany({});
        console.log("✅ Cleared.");

        console.log("⏳ Seeding 50 jobs (TCS, HCL, Wipro, etc.)...");
        await Job.insertMany(jobList);
        console.log(`✅ Success! Seeded ${jobList.length} jobs.`);
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding jobs:", error);
        process.exit(1);
    }
}

seedJobs();
