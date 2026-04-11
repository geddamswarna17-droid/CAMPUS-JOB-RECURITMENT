const https = require('https');

https.get('https://api.ipify.org', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('🌍 Your External IP Address is:', data);
        console.log('👉 Make sure this IP is whitelisted in MongoDB Atlas under "Network Access"');
        process.exit(0);
    });
}).on('error', err => {
    console.error('Error fetching IP:', err.message);
    process.exit(1);
});
