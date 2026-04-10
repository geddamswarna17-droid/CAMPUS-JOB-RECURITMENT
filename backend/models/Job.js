const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    details: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    colorClass: { type: String, required: true },
    deadline: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    category: { type: String, default: 'Engineering' },
    sector: { type: String, enum: ['Private', 'Government'], default: 'Private' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
