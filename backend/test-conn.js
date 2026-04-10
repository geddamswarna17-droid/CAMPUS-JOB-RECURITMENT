const { MongoClient } = require('mongodb');

const uri = 'mongodb://geddamswarna17_db_user:Swarna17@ac-m8l9195-shard-00-00.8qn9il8.mongodb.net:27017,ac-m8l9195-shard-00-01.8qn9il8.mongodb.net:27017,ac-m8l9195-shard-00-02.8qn9il8.mongodb.net:27017/campus-hiring?ssl=true&replicaSet=atlas-m8l9195-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("Connected correctly to server");
    process.exit(0);
  } catch (error) {
    console.log("Connection Error:", error);
    process.exit(1);
  }
}
run();
