const { MongoClient } = require('mongodb');

async function checkLocal() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('campus-hiring');
        const count = await db.collection('users').countDocuments();
        console.log(`🏠 Local User Count (Compass): ${count}`);
    } catch (e) {
        console.error(e.message);
    } finally {
        await client.close();
        process.exit(0);
    }
}
checkLocal();
