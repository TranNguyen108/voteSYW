require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./models/config');

async function setVotingClosed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Set voting status to closed
        await Config.findOneAndUpdate(
            { key: 'votingStatus' },
            { value: 'closed', updatedAt: new Date() },
            { upsert: true }
        );

        // Set end time to now
        await Config.findOneAndUpdate(
            { key: 'votingEndTime' },
            { value: new Date(), updatedAt: new Date() },
            { upsert: true }
        );

        console.log('🛑 Voting status set to closed');
        console.log('⏰ End time set to current time');

        // Check current config
        const status = await Config.findOne({ key: 'votingStatus' });
        const endTime = await Config.findOne({ key: 'votingEndTime' });
        
        console.log('📊 Current voting status:', status?.value);
        console.log('⏰ Current end time:', endTime?.value);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

setVotingClosed();
