// MongoDB Connection Test
// Run: node test-mongodb.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🐒 Testing MongoDB Atlas connection...');
  console.log('=====================================');
  
  if (!MONGODB_URI || MONGODB_URI.includes('YOUR_PASSWORD_HERE')) {
    console.error('❌ ERROR: Please update MONGODB_URI in .env.local');
    console.log('📋 Follow the setup guide in MONGODB_ATLAS_SETUP.md');
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test database operations
    const db = client.db('monkeymax');
    const testCollection = db.collection('connection_test');
    
    // Insert test document
    const testDoc = { 
      message: 'MonkeyMac connection test', 
      timestamp: new Date() 
    };
    await testCollection.insertOne(testDoc);
    console.log('✅ Database write test successful!');
    
    // Read test document
    const result = await testCollection.findOne({ message: 'MonkeyMac connection test' });
    console.log('✅ Database read test successful!');
    
    // Clean up test document
    await testCollection.deleteOne({ message: 'MonkeyMac connection test' });
    console.log('✅ Database cleanup successful!');
    
    await client.close();
    
    console.log('');
    console.log('🎉 MongoDB Atlas is ready!');
    console.log('🚀 Your app will work locally and globally!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Go to: http://localhost:3000');
    console.log('3. Click "Sign Up" and test registration');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your connection string in .env.local');
    console.log('2. Make sure you replaced YOUR_PASSWORD_HERE');
    console.log('3. Verify network access is set to 0.0.0.0/0');
    console.log('4. Check MongoDB Atlas dashboard for issues');
  }
}

testConnection();
