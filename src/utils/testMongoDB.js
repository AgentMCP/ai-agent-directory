// Test script for MongoDB connection
import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-directory';
  const client = new MongoClient(uri);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Fetch a count of agents
    if (collections.some(c => c.name === 'agents')) {
      const agentsCount = await db.collection('agents').countDocuments();
      console.log(`Total agents in database: ${agentsCount}`);
    } else {
      console.log('No agents collection found.');
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testConnection()
  .then(success => {
    console.log('Test completed:', success ? 'Connection successful' : 'Connection failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
    process.exit(1);
  });
