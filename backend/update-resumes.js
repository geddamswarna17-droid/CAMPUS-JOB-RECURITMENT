const mongoose = require('mongoose');

async function updateResumes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/campus-hiring');
    console.log('✅ Connected to MongoDB');
    
    const Application = require('./models/Application');
    const resumes = ['sample1.pdf', 'sample2.pdf', 'sample3.pdf'];
    
    // Get all applications
    const apps = await Application.find({});
    console.log(`Found ${apps.length} applications`);
    
    // Update each application with a resume
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const resumeFile = resumes[i % resumes.length];
      
      app.resumePath = resumeFile;
      app.resumeName = resumeFile;
      
      // Also ensure other fields exist
      if (!app.mobile) app.mobile = '+1234567890';
      if (!app.state) app.state = 'California';
      if (!app.education) app.education = 'B.Tech Computer Science';
      if (!app.experience) app.experience = 'Fresher';
      if (!app.skills) app.skills = 'JavaScript, React, Node.js';
      
      await app.save();
      console.log(`✅ Updated: ${app.name} - ${resumeFile}`);
    }
    
    console.log('\n🎉 All applications updated with resume files!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateResumes();
