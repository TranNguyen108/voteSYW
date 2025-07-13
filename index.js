const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import models
const Team = require('./models/team');
const Vote = require('./models/vote');
const Config = require('./models/config');

// Import routes
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const resultRoutes = require('./routes/result');
const submitRoutes = require('./routes/submit');

const app = express();

// For Vercel, we export the app directly
if (process.env.NODE_ENV !== 'production') {
    // Local development with Socket.IO
    const server = http.createServer(app);
    const io = socketIo(server);
    app.set('socketio', io);
    
    // Socket.IO handling
    io.on('connection', (socket) => {
        console.log('👤 User connected:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('👋 User disconnected:', socket.id);
        });
    });
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true);

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// MongoDB connection
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    
    try {
        const mongoUri = process.env.MONGODB_URI;
        
        console.log('🔍 Checking MongoDB connection...');
        console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
        console.log('🔍 MongoDB URI exists:', !!mongoUri);
        console.log('🔍 MongoDB URI length:', mongoUri ? mongoUri.length : 0);
        
        if (!mongoUri) {
            throw new Error('❌ MONGODB_URI environment variable not set');
        }
        
        if (mongoUri.includes('<password>')) {
            throw new Error('❌ MongoDB Atlas URI contains placeholder <password>');
        }
        
        if (!mongoUri.startsWith('mongodb')) {
            throw new Error('❌ Invalid MongoDB URI format');
        }

        console.log('🔄 Attempting MongoDB connection...');
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            connectTimeoutMS: 10000,
        });
        
        isConnected = true;
        console.log('✅ Kết nối MongoDB Atlas thành công!');

        // Test database operations
        const config = await Config.findOne({ key: 'voteDuration' });
        if (!config) {
            await Config.create({ key: 'voteDuration', value: 5 });
            console.log('⚙️ Đã tạo cấu hình mặc định');
        }
        
        console.log('✅ Database operations working!');

    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        isConnected = false;
        throw error;
    }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('❌ Database middleware error:', error.message);
        res.status(500).render('error', {
            error: { 
                status: 500, 
                message: `Lỗi kết nối database: ${error.message}` 
            }
        });
    }
});

// Routes
app.get('/', async (req, res) => {
    try {
        const teamCount = await Team.countDocuments();
        res.render('index', { teamCount });
    } catch (error) {
        console.error('Error loading home page:', error);
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

// Voting closed page route
app.get('/voting-closed', (req, res) => {
    res.render('voting_closed');
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', {
        error: { status: 500, message: 'Lỗi hệ thống' }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        error: { status: 404, message: 'Không tìm thấy trang' }
    });
});

// For Vercel, export the app
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    const server = http.createServer(app);
    const io = socketIo(server);
    
    app.set('socketio', io);
    
    io.on('connection', (socket) => {
        console.log('👤 User connected:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('👋 User disconnected:', socket.id);
        });
    });
    
    connectDB().then(() => {
        server.listen(PORT, () => {
            console.log(`🎉 Hệ thống bình chọn đang chạy tại http://localhost:${PORT}`);
            console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
            console.log('🔧 Sử dụng Ctrl+C để dừng server');
        });
    });
}
