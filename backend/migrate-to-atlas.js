const { MongoClient } = require('mongodb');
const dns = require('dns');
require('dotenv').config();

// Fix for ECONNREFUSED with mongodb+srv on some networks/Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const LOCAL_URI = 'mongodb://localhost:27017';
const ATLAS_URI = process.env.MONGODB_URI;
const DB_NAME = 'campus-hiring';

async function migrate() {
    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
        console.log('Connecting to local MongoDB...');
        await localClient.connect();
        console.log('Connected to local MongoDB.');

        console.log('Connecting to MongoDB Atlas...');
        await atlasClient.connect();
        console.log('Connected to MongoDB Atlas.');

        const localDb = localClient.db(DB_NAME);
        const atlasDb = atlasClient.db(DB_NAME);

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const colDef of collections) {
            const collectionName = colDef.name;
            console.log(`Migrating collection: ${collectionName}...`);

            const localCollection = localDb.collection(collectionName);
            const atlasCollection = atlasDb.collection(collectionName);

            const data = await localCollection.find({}).toArray();
            
            if (data.length > 0) {
                // Clear the destination collection first (optional, but safer for a clean migration)
                await atlasCollection.deleteMany({});
                await atlasCollection.insertMany(data);
                console.log(`Successfully migrated ${data.length} documents from ${collectionName}.`);
            } else {
                console.log(`Collection ${collectionName} is empty, skipping.`);
            }
        }

        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();
