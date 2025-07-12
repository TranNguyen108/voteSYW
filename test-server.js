require('dotenv').config();
const express = require('express');
const path = require('path');

// Import models
const Team = require('./models/team');
const Config = require('./models/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true);

// Simple test route
app.get('/test', (req, res) => {
    res.send('Test route works!');
});

// Admin route
app.get('/admin', async (req, res) => {
    try {
        console.log('🔍 Admin route called');
        
        // Sample data for testing
        const teams = [
            { _id: '1', name: 'Test Team 1', description: 'Test Description 1', createdAt: new Date() },
            { _id: '2', name: 'Test Team 2', description: 'Test Description 2', createdAt: new Date() }
        ];
        
        const voteDuration = 5; // 5 minutes
        
        const data = { 
            teams: teams,
            voteDuration: voteDuration
        };
        
        console.log('📤 Rendering admin with data:', data);
        res.render('admin', data);
    } catch (error) {
        console.error('❌ Admin route error:', error);
        res.status(500).send('Server Error: ' + error.message);
    }
});

// Main route
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to Voting System</h1>
        <p><a href="/admin">Go to Admin</a></p>
        <p><a href="/test">Test Route</a></p>
    `);
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Error: ' + err.message);
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`🎉 Test server running at http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    process.exit(0);
});
