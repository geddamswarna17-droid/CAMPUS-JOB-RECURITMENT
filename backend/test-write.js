require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const User = require('./models/User');

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected. Attempting to write test user...');
    
    const testEmail = `test_${Date.now()}@example.com`;
    const user = new User({
        name: 'Test User',
        email: testEmail,
        mobile: '1234567890',
        state: 'TestState',
        password: 'password123'
    });
    
    await user.save();
    console.log('✅ User saved successfully:', testEmail);
    
    const found = await User.findOne({ email: testEmail });
    console.log('✅ User found in DB:', found ? 'Yes' : 'No');
    
    // Cleanup
    await User.deleteOne({ email: testEmail });
    console.log('✅ Test user cleaned up.');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Write Error:', err);
    process.exit(1);
  });
