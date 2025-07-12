require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./models/config');

async function setVotingActive() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Set voting status to active
        await Config.findOneAndUpdate(
            { key: 'votingStatus' },
            { value: 'active', updatedAt: new Date() },
            { upsert: true }
        );

        // Set end time to 10 minutes from now
        const futureTime = new Date(Date.now() + 10 * 60 * 1000);
        await Config.findOneAndUpdate(
            { key: 'votingEndTime' },
            { value: futureTime, updatedAt: new Date() },
            { upsert: true }
        );

        console.log('✅ Voting status set to active');
        console.log('⏰ End time set to:', futureTime);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

setVotingActive();
