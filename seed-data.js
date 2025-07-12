require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/team');
const Vote = require('./models/vote');
const Config = require('./models/config');

// Sample teams data
const sampleTeams = [
    { 
        name: 'Đội Ánh Dương', 
        description: 'Nhóm nhảy hiện đại với những vũ điệu sôi động' 
    },
    { 
        name: 'Đội Sao Băng', 
        description: 'Nhóm hát pop ballad với giọng ca ngọt ngào' 
    },
    { 
        name: 'Đội Rồng Vàng', 
        description: 'Nhóm múa truyền thống mang đậm bản sắc văn hóa' 
    },
    { 
        name: 'Đội Phoenix', 
        description: 'Nhóm biểu diễn tổng hợp đa dạng thể loại' 
    },
    { 
        name: 'Đội Thiên Thần', 
        description: 'Nhóm hát đồng ca với hòa âm tuyệt vời' 
    },
    { 
        name: 'Đội Bão Tố', 
        description: 'Nhóm nhảy hip-hop với động tác mạnh mẽ' 
    }
];

// Sample votes to make it realistic
const generateSampleVotes = async (teams) => {
    const sampleVotes = [];
    const ips = [
        '192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4',
        '192.168.1.5', '192.168.1.6', '192.168.1.7', '192.168.1.8',
        '192.168.1.9', '192.168.1.10', '10.0.0.1', '10.0.0.2',
        '172.16.0.1', '172.16.0.2', '172.16.0.3'
    ];

    // Generate random votes for teams
    for (let i = 0; i < 50; i++) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        const randomIP = ips[Math.floor(Math.random() * ips.length)];
        
        sampleVotes.push({
            teamId: randomTeam._id,
            ip: randomIP,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
        });
    }

    return sampleVotes;
};

async function seedDatabase() {
    try {
        console.log('🌱 Bắt đầu seed dữ liệu...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công!');

        // Clear existing data
        console.log('🧹 Xóa dữ liệu cũ...');
        await Team.deleteMany({});
        await Vote.deleteMany({});
        await Config.deleteMany({});

        // Create teams
        console.log('👥 Tạo đội thi mẫu...');
        const createdTeams = await Team.insertMany(sampleTeams);
        console.log(`✅ Đã tạo ${createdTeams.length} đội thi`);

        // Create sample votes
        console.log('🗳️ Tạo votes mẫu...');
        const sampleVotes = await generateSampleVotes(createdTeams);
        await Vote.insertMany(sampleVotes);
        console.log(`✅ Đã tạo ${sampleVotes.length} votes mẫu`);

        // Create default config
        console.log('⚙️ Tạo cấu hình mặc định...');
        const defaultConfig = [
            { key: 'voteDuration', value: 300 }, // 5 minutes
            { key: 'systemName', value: 'Bình Chọn' },
            { key: 'allowMultipleVotes', value: true },
            { key: 'maxVotesPerIP', value: 5 }
        ];
        
        await Config.insertMany(defaultConfig);
        console.log(`✅ Đã tạo ${defaultConfig.length} cấu hình`);

        // Display summary
        console.log('\n📊 TÓM TẮT DỮ LIỆU:');
        console.log(`👥 Đội thi: ${createdTeams.length}`);
        console.log(`🗳️ Votes: ${sampleVotes.length}`);
        console.log(`⚙️ Cấu hình: ${defaultConfig.length}`);

        // Show vote distribution
        console.log('\n📈 PHÂN BỐ VOTES:');
        for (const team of createdTeams) {
            const voteCount = sampleVotes.filter(vote => vote.teamId.toString() === team._id.toString()).length;
            console.log(`${team.name}: ${voteCount} votes`);
        }

        console.log('\n🎉 Seed dữ liệu hoàn tất!');
        console.log('🚀 Khởi động server: npm start');
        console.log('🌐 Truy cập: http://localhost:3000');

    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Đã ngắt kết nối database');
    }
}

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
