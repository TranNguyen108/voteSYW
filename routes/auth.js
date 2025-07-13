const express = require('express');
const router = express.Router();

// Environment variables for passwords
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const VOTE_PASSWORD = process.env.VOTE_PASSWORD || 'vote123';

// GET login page
router.get('/login', (req, res) => {
    const type = req.query.type || 'admin';
    const returnUrl = req.query.return || '/';
    const error = req.query.error;
    
    res.render('login', { 
        type: type,
        returnUrl: returnUrl,
        error: error
    });
});

// POST login
router.post('/login', (req, res) => {
    const { password, type, returnUrl } = req.body;
    
    console.log(`🔐 Login attempt for ${type} page`);
    
    let isValid = false;
    
    if (type === 'admin' && password === ADMIN_PASSWORD) {
        req.session.adminAuthenticated = true;
        isValid = true;
        console.log('✅ Admin login successful');
    } else if (type === 'vote' && password === VOTE_PASSWORD) {
        req.session.voteAuthenticated = true;
        isValid = true;
        console.log('✅ Vote login successful');
    }
    
    if (isValid) {
        // Redirect to original URL or default
        const redirectUrl = returnUrl || (type === 'admin' ? '/admin' : '/vote');
        res.redirect(redirectUrl);
    } else {
        console.log('❌ Login failed - wrong password');
        res.redirect(`/login?type=${type}&return=${encodeURIComponent(returnUrl)}&error=1`);
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.adminAuthenticated = false;
    req.session.voteAuthenticated = false;
    console.log('🚪 User logged out');
    res.redirect('/');
});

module.exports = router;
