const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    state: { type: String, required: true },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    skills: { type: String, required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    status: { type: String, default: "Under Review" },
    theme: { type: String, default: "neutral" },
    resumeName: { type: String, default: "Not Provided" },
    resumePath: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
