const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function setupUploads() {
  try {
    // Create uploads directory - handle case where it might be a file
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // Check if uploads exists as a file and remove it
    try {
      const stats = fs.statSync(uploadsDir);
      if (stats.isFile()) {
        fs.unlinkSync(uploadsDir);
        console.log('✅ Removed uploads file');
      }
    } catch (e) {
      // File doesn't exist, which is fine
    }
    
    // Create proper uploads directory
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } else {
      console.log('✅ Uploads directory already exists');
    }

    // Create sample resume files
    const resumes = [
      { name: 'sample-resume.pdf', content: 'Sample PDF Resume Content' },
      { name: 'test-resume.txt', content: 'Sample Text Resume Content' },
      { name: 'demo-resume.pdf', content: 'Demo PDF Resume Content' }
    ];

    resumes.forEach(resume => {
      const filePath = path.join(uploadsDir, resume.name);
      fs.writeFileSync(filePath, resume.content);
      console.log(`✅ Created: ${resume.name}`);
    });

    // List all files
    const files = fs.readdirSync(uploadsDir);
    console.log('\n📁 Files in uploads directory:', files);

    // Update database
    await mongoose.connect('mongodb://localhost:27017/campus-hiring');
    console.log('\n✅ Connected to MongoDB');

    const Application = require('./models/Application');
    
    // Update existing applications with sample resume paths
    const applications = await Application.find({});
    console.log(`\n📋 Found ${applications.length} applications`);

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      if (!app.resumePath || app.resumePath === '') {
        // Assign a sample resume
        const sampleResume = resumes[i % resumes.length].name;
        app.resumePath = sampleResume;
        app.resumeName = sampleResume;
        await app.save();
        console.log(`✅ Updated application ${app._id} with resume: ${sampleResume}`);
      }
    }

    console.log('\n🎉 Setup complete! Resume viewing should now work.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupUploads();
