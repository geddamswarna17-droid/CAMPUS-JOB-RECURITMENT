const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function createProperResumes() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // Create proper text resume files
    const resumes = [
      { name: 'resume-geetha.txt', content: 'RESUME - GEETHA\n\nName: Geetha\nEmail: geetha@gmail.com\nMobile: +91-9876543210\nState: Andhra Pradesh\nEducation: B.Tech Computer Science\nExperience: Fresher\nSkills: JavaScript, HTML, CSS, Python\n\nEducation:\n- B.Tech in Computer Science, Andhra University (2024)\n- Intermediate, Sri Chaitanya College (2020)\n\nProjects:\n- E-commerce Website using React\n- Chat Application using Node.js\n\nDeclaration:\nI hereby declare that the above information is true.' },
      
      { name: 'resume-samhitha.txt', content: 'RESUME - SAMHITHA\n\nName: Samhitha\nEmail: samhi@gmail.com\nMobile: +91-8765432109\nState: Telangana\nEducation: B.Tech Information Technology\nExperience: 0-1 years\nSkills: Java, Spring Boot, MySQL, Angular\n\nEducation:\n- B.Tech in IT, JNTU Hyderabad (2023)\n\nExperience:\n- Intern at Tech Solutions (6 months)\n\nProjects:\n- Library Management System\n- Online Banking Portal\n\nDeclaration:\nAll information provided is correct.' },
      
      { name: 'resume-deepthi.txt', content: 'RESUME - DEEPTHI\n\nName: Deepthi\nEmail: deepthi@gmail.com\nMobile: +91-7654321098\nState: Karnataka\nEducation: B.E. Computer Science\nExperience: Fresher\nSkills: Python, Django, React, MongoDB\n\nEducation:\n- B.E. in CSE, Bangalore University (2024)\n\nCertifications:\n- AWS Certified Cloud Practitioner\n- Google Data Analytics Certificate\n\nProjects:\n- Weather App using React\n- Blog Platform using Django\n\nDeclaration:\nInformation provided is accurate.' },
      
      { name: 'resume-reddy.txt', content: 'RESUME - REDDY\n\nName: Reddy\nEmail: reddy@gmail.com\nMobile: +91-6543210987\nState: Tamil Nadu\nEducation: MCA\nExperience: 1-3 years\nSkills: PHP, Laravel, Vue.js, PostgreSQL\n\nEducation:\n- MCA, Anna University (2022)\n\nExperience:\n- Software Developer at WebTech (2 years)\n\nProjects:\n- CRM System\n- Inventory Management\n\nDeclaration:\nAll details are true.' },
      
      { name: 'resume-usha.txt', content: 'RESUME - USHA\n\nName: Usha\nEmail: usha@gmail.com\nMobile: +91-5432109876\nState: Kerala\nEducation: BCA\nExperience: Fresher\nSkills: C#, .NET, SQL Server, Bootstrap\n\nEducation:\n- BCA, Kerala University (2024)\n\nProjects:\n- Student Portal\n- Online Quiz System\n\nDeclaration:\nInformation is correct.' },
      
      { name: 'resume-raja.txt', content: 'RESUME - RAJA\n\nName: Raja\nEmail: raja@gmail.com\nMobile: +91-4321098765\nState: Maharashtra\nEducation: B.Tech Electronics\nExperience: Fresher\nSkills: Embedded C, IoT, Python, Arduino\n\nEducation:\n- B.Tech, Mumbai University (2024)\n\nProjects:\n- Smart Home Automation\n- Weather Monitoring System\n\nDeclaration:\nDetails are accurate.' }
    ];
    
    // Create each resume file
    resumes.forEach(resume => {
      const filePath = path.join(uploadsDir, resume.name);
      fs.writeFileSync(filePath, resume.content);
      console.log(`✅ Created: ${resume.name}`);
    });
    
    // Connect to database and update applications
    await mongoose.connect('mongodb://localhost:27017/campus-hiring');
    console.log('\n✅ Connected to MongoDB');
    
    const Application = require('./models/Application');
    const apps = await Application.find({});
    
    console.log(`\n📋 Found ${apps.length} applications`);
    
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const resumeFile = resumes[i % resumes.length].name;
      
      app.resumePath = resumeFile;
      app.resumeName = resumeFile;
      
      // Ensure other fields exist
      if (!app.mobile) app.mobile = '+91-9876543210';
      if (!app.state) app.state = 'Andhra Pradesh';
      if (!app.education) app.education = 'B.Tech Computer Science';
      if (!app.experience) app.experience = 'Fresher';
      if (!app.skills) app.skills = 'JavaScript, React, Node.js';
      
      await app.save();
      console.log(`✅ Updated: ${app.name} → ${resumeFile}`);
    }
    
    console.log('\n🎉 Resume files created and linked successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createProperResumes();
