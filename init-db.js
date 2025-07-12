const mongoose = require('mongoose');
const Team = require('./models/team');
const Config = require('./models/config');

// Sample data
const sampleTeams = [
    { name: 'Đội Ánh Dương', description: 'Nhóm nhảy hiện đại' },
    { name: 'Đội Sao Băng', description: 'Nhóm hát pop ballad' },
    { name: 'Đội Rồng Vàng', description: 'Nhóm múa truyền thống' },
    { name: 'Đội Phoenix', description: 'Nhóm biểu diễn tổng hợp' }
];

const defaultConfig = [
    { key: 'voteDuration', value: 300 }, // 5 minutes
    { key: 'systemName', value: 'Bình Chọn' },
    { key: 'allowMultipleVotes', value: true }
];

async function initDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system';
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('🔗 Connected to MongoDB for initialization');

        // Check if teams already exist
        const existingTeams = await Team.countDocuments();
        if (existingTeams === 0) {
            await Team.insertMany(sampleTeams);
            console.log('✅ Sample teams inserted');
        } else {
            console.log('ℹ️  Teams already exist, skipping sample data');
        }

        // Initialize default config
        for (const configItem of defaultConfig) {
            const existing = await Config.findOne({ key: configItem.key });
            if (!existing) {
                await Config.create(configItem);
                console.log(`✅ Config ${configItem.key} initialized`);
            }
        }

        console.log('🎉 Database initialization completed');
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };
