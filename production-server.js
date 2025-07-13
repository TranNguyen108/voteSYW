require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server-core');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const resultRoutes = require('./routes/result');
const submitRoutes = require('./routes/submit');
const dataRoutes = require('./routes/data');

// Import models
const Team = require('./models/team');
const Config = require('./models/config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// MongoDB connection state for Vercel
let isConnected = false;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true);

// Set up Socket.IO middleware
app.set('socketio', io);

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Database connection middleware for Vercel
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('❌ Database middleware error:', error);
        res.status(500).render('error', {
            error: { 
                status: 500, 
                message: `Lỗi kết nối database: ${error.message}` 
            }
        });
    }
});

async function connectToDatabase() {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;
        
        console.log('🔍 Checking environment...');
        console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
        console.log('🔍 MongoDB URI exists:', !!mongoUri);
        
        if (!mongoUri) {
            throw new Error('❌ MONGODB_URI environment variable not found');
        }
        
        if (mongoUri.includes('<password>')) {
            throw new Error('❌ MongoDB Atlas URI contains placeholder <password>');
        }

        console.log('🔄 Connecting to MongoDB Atlas...');
        // Connect to MongoDB Atlas with proper timeouts
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000,
            maxPoolSize: 10,
            bufferCommands: false,
        });
        
        isConnected = true;
        console.log('✅ Kết nối MongoDB Atlas thành công!');

        // Initialize default config
        const config = await Config.findOne({ key: 'voteDuration' });
        if (!config) {
            await Config.create({ key: 'voteDuration', value: 5 });
            console.log('⚙️ Đã tạo cấu hình mặc định');
        }

        // Create sample teams if none exist
        const teamCount = await Team.countDocuments();
        if (teamCount === 0) {
            const sampleTeams = [
                { name: 'Đội Ánh Dương', description: 'Nhóm nhảy hiện đại' },
                { name: 'Đội Sao Băng', description: 'Nhóm hát pop ballad' },
                { name: 'Đội Rồng Vàng', description: 'Nhóm múa truyền thống' },
                { name: 'Đội Phoenix', description: 'Nhóm biểu diễn tổng hợp' }
            ];
            
            await Team.insertMany(sampleTeams);
            console.log(`👥 Đã tạo ${sampleTeams.length} đội thi mẫu`);
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        isConnected = false;
        throw error;
    }
}

async function startServer() {
    try {
        console.log('🚀 Starting MongoDB Atlas Voting System...');
        
        // Connect to database
        await connectToDatabase();

        // Routes
        app.get('/', async (req, res) => {
            try {
                const teamCount = await Team.countDocuments();
                res.render('index', { teamCount });
            } catch (error) {
                console.error('❌ Error loading homepage:', error);
                res.render('index', { teamCount: 0 });
            }
        });

        // Debug middleware
        app.use('/admin', (req, res, next) => {
            console.log(`🔍 Admin middleware: ${req.method} ${req.path}`);
            next();
        });

        app.use('/admin', adminRoutes);
        app.use('/vote', voteRoutes);
        app.use('/result', resultRoutes);
        app.use('/submit', submitRoutes);
        // app.use('/data', dataRoutes); // Temporarily disabled to avoid route conflicts

        // Voting closed page route
        app.get('/voting-closed', (req, res) => {
            res.render('voting_closed');
        });

        // Error handling
        app.use((err, req, res, next) => {
            console.error('❌ Application error:', err);
            res.status(500).render('error', {
                error: { status: 500, message: `Lỗi hệ thống: ${err.message}` }
            });
        });

        // 404 handler
        app.use((req, res) => {
            res.status(404).render('error', {
                error: { status: 404, message: 'Không tìm thấy trang' }
            });
        });

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            console.log('👤 User connected:', socket.id);
            
            socket.on('disconnect', () => {
                console.log('👋 User disconnected:', socket.id);
            });
        });

        // For Vercel, export the app instead of starting server
        if (process.env.NODE_ENV === 'production') {
            console.log('🚀 Production mode: Exporting app for Vercel');
            return app; // Return app for Vercel
        }

        // Start server for local development
        server.listen(PORT, () => {
            console.log(`🎉 Hệ thống bình chọn đang chạy tại http://localhost:${PORT}`);
            console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
            console.log('🔧 Sử dụng Ctrl+C để dừng server');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Đang tắt server...');
            await mongoose.disconnect();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
}

// Initialize the server
startServer().then((app) => {
    if (process.env.NODE_ENV === 'production') {
        module.exports = app;
    }
}).catch((error) => {
    console.error('❌ Failed to initialize server:', error);
    if (process.env.NODE_ENV === 'production') {
        throw error;
    }
});
