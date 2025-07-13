const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🧪 Testing MongoDB Connection...');
        console.log('🔍 Environment Variables:');
        console.log('  - MONGODB_URI exists:', !!process.env.MONGODB_URI);
        console.log('  - ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
        console.log('  - NODE_ENV:', process.env.NODE_ENV);
        
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('❌ MONGODB_URI not found in environment variables');
        }
        
        if (mongoUri.includes('<password>')) {
            throw new Error('❌ MONGODB_URI contains placeholder <password>');
        }
        
        console.log('🔄 Connecting to MongoDB...');
        console.log('🔍 URI format check:', mongoUri.substring(0, 50) + '...');
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        console.log('✅ MongoDB connection successful!');
        
        // Test basic operations
        console.log('🧪 Testing database operations...');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('📂 Available collections:', collections.map(c => c.name));
        
        // Test creating a document
        const testCollection = db.collection('test');
        const testDoc = await testCollection.insertOne({ test: true, timestamp: new Date() });
        console.log('✅ Insert test successful:', testDoc.insertedId);
        
        // Test reading
        const foundDoc = await testCollection.findOne({ _id: testDoc.insertedId });
        console.log('✅ Read test successful:', !!foundDoc);
        
        // Cleanup
        await testCollection.deleteOne({ _id: testDoc.insertedId });
        console.log('✅ Delete test successful');
        
        console.log('🎉 All tests passed! Ready for Vercel deployment.');
        
    } catch (error) {
        console.error('❌ Connection test failed:');
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('💡 Possible solutions:');
            console.error('   1. Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)');
            console.error('   2. Verify username/password in connection string');
            console.error('   3. Check if cluster is running');
        }
        
        if (error.message.includes('authentication failed')) {
            console.error('💡 Authentication error solutions:');
            console.error('   1. Check username/password');
            console.error('   2. Ensure user has proper permissions');
            console.error('   3. Try recreating database user');
        }
        
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testConnection();
