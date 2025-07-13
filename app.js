require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'syw-vote-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Trust proxy for getting real IP addresses
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('💡 Tip: Nếu MongoDB local chưa cài đặt, bạn có thể:');
    console.log('   1. Cài MongoDB Community Server: https://www.mongodb.com/try/download/community');
    console.log('   2. Hoặc sử dụng MongoDB Atlas (free): https://www.mongodb.com/atlas');
    console.log('   3. Sau đó cập nhật MONGODB_URI trong environment variables');
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const resultRoutes = require('./routes/result');
const submitRoutes = require('./routes/submit');
const dataRoutes = require('./routes/data');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/vote', voteRoutes);
app.use('/result', resultRoutes);
app.use('/submit', submitRoutes);
app.use('/data', dataRoutes);

// Home route
app.get('/', async (req, res) => {
    try {
        const Team = require('./models/team');
        const teamCount = await Team.countDocuments();
        res.render('index', { teamCount });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.render('index', { teamCount: 0 });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        error: { 
            status: 404, 
            message: 'Trang không tìm thấy' 
        } 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        error: {
            status: err.status || 500,
            message: err.message || 'Lỗi server'
        }
    });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    
    // Send current stats on connection
    socket.emit('connected', {
        message: 'Kết nối thành công',
        timestamp: new Date()
    });
    
    // Handle admin requests for live stats
    socket.on('requestStats', async () => {
        try {
            const Vote = require('./models/vote');
            const totalVotes = await Vote.countDocuments();
            socket.emit('statsUpdate', { totalVotes, timestamp: new Date() });
        } catch (error) {
            console.error('Error getting stats for socket:', error);
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`👤 User disconnected: ${socket.id}`);
    });
});

// Make io accessible to routes
app.set('socketio', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
