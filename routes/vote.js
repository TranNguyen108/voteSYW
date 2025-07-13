const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Team = require('../models/team');
const Config = require('../models/config');
const { requireAuth } = require('../middleware/auth');

// Simple rate limiting
const voteSessions = new Map();

function checkVoteSession(teamId, ip) {
    const key = `${teamId}_${ip}`;
    const now = Date.now();
    const session = voteSessions.get(key);
    
    if (session && (now - session.lastVote) < 5000) { // 5 seconds cooldown
        return false;
    }
    
    voteSessions.set(key, { lastVote: now });
    
    // Cleanup old sessions (older than 1 hour)
    for (const [sessionKey, sessionData] of voteSessions.entries()) {
        if ((now - sessionData.lastVote) > 3600000) {
            voteSessions.delete(sessionKey);
        }
    }
    
    return true;
}

// Get vote page (list of teams) - PROTECTED
router.get('/', requireAuth('vote'), async (req, res) => {
    try {
        console.log('🔍 Vote page - Loading team list');
        const teams = await Team.find().sort({ createdAt: -1 });
        res.render('vote', { teams: teams });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Get vote page for specific team - PROTECTED
router.get('/:teamId', requireAuth('vote'), async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).send('Team not found');
        }

        // Get vote duration config
        let config = await Config.findOne({ key: 'voteDuration' });
        if (!config) {
            config = new Config({
                key: 'voteDuration',
                value: 5 // 5 minutes default
            });
            await config.save();
        }

        const currentTime = new Date();
        let needsUpdate = false;

        // Check if this team's voting session is active
        if (!team.votingActive || !team.votingEndTime || currentTime > team.votingEndTime) {
            // Start new voting session for this team
            team.votingStartTime = currentTime;
            team.votingEndTime = new Date(currentTime.getTime() + (config.value * 60 * 1000)); // Add minutes in milliseconds
            team.votingActive = true;
            needsUpdate = true;
            console.log(`🚀 Starting voting session for team ${team.name} - Duration: ${config.value} minutes, End time: ${team.votingEndTime}`);
        } else {
            console.log(`✅ Team ${team.name} voting session is active until: ${team.votingEndTime}`);
        }

        if (needsUpdate) {
            await team.save();
        }

        // Generate QR code for submit URL WITHOUT session (will auto-generate session on access)
        const submitUrl = `${req.protocol}://${req.get('host')}/submit/${req.params.teamId}`;
        
        console.log(`🔍 Generated QR URL for team ${team.name}: ${submitUrl}`);
        
        const qrCodeDataURL = await QRCode.toDataURL(submitUrl, {
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.render('vote_team', {
            team: team,
            qrCode: qrCodeDataURL,
            submitUrl: submitUrl,
            voteDuration: config.value * 60 * 1000, // Convert minutes to milliseconds for JavaScript
            votingEndTime: team.votingEndTime // Use team-specific end time
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
