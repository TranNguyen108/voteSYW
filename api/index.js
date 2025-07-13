require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const adminRoutes = require('../routes/admin');
const voteRoutes = require('../routes/vote');
const resultRoutes = require('../routes/result');
const submitRoutes = require('../routes/submit');

// Import models
const Team = require('../models/team');
const Config = require('../models/config');

const app = express();

// MongoDB connection state
let isConnected = false;
let isConfigInitialized = false;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.set('trust proxy', true);

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Database connection function
async function connectToDatabase() {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;
        
        console.log('🔍 Checking environment...');
        console.log('🔍 MongoDB URI exists:', !!mongoUri);
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable not found');
        }
        
        if (mongoUri.includes('<password>')) {
            throw new Error('MongoDB Atlas URI contains placeholder <password>');
        }

        console.log('🔄 Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000,
            maxPoolSize: 5,
            bufferCommands: false,
        });
        
        isConnected = true;
        console.log('✅ MongoDB Atlas connected successfully!');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        isConnected = false;
        throw error;
    }
}

// Initialize default configuration
async function initializeConfig() {
    if (isConfigInitialized) {
        return;
    }
    
    try {
        const config = await Config.findOne({ key: 'voteDuration' });
        if (!config) {
            await Config.create({ key: 'voteDuration', value: 5 });
            console.log('⚙️ Default config created');
        }
        isConfigInitialized = true;
    } catch (error) {
        console.error('⚠️ Config initialization warning:', error.message);
    }
}

// Database middleware
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        
        // Initialize config after successful connection
        await initializeConfig();
        
        next();
    } catch (error) {
        console.error('❌ Database middleware error:', error.message);
        res.status(500).json({
            error: 'Database connection failed',
            message: error.message
        });
    }
});

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: isConnected ? 'connected' : 'disconnected'
    });
});

// Debug middleware for admin routes
app.use('/admin', (req, res, next) => {
    console.log(`🔍 Admin middleware: ${req.method} ${req.path}`);
    next();
});

// Mount routes
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
    console.error('❌ Application error:', err.message);
    
    // Check if it's an API request
    if (req.path.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
        res.status(500).json({
            error: 'Internal server error',
            message: err.message
        });
    } else {
        // Try to render error page, fallback to simple response
        try {
            res.status(500).render('error', {
                error: { status: 500, message: 'Lỗi hệ thống' }
            });
        } catch (renderError) {
            res.status(500).send(`
                <h1>500 - Server Error</h1>
                <p>Something went wrong. Please try again later.</p>
                <a href="/">Go Home</a>
            `);
        }
    }
});

// 404 handler
app.use((req, res) => {
    // Check if it's an API request
    if (req.path.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
        res.status(404).json({
            error: 'Not found',
            message: 'Endpoint not found'
        });
    } else {
        try {
            res.status(404).render('error', {
                error: { status: 404, message: 'Không tìm thấy trang' }
            });
        } catch (renderError) {
            res.status(404).send(`
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/">Go Home</a>
            `);
        }
    }
});

module.exports = app;
