const express = require('express');
const router = express.Router();
const Vote = require('../models/vote');
const Team = require('../models/team');
const Config = require('../models/config');

// Simple rate limiting
const voteAttempts = new Map();

// Session tracking for preventing reload spam
const usedSessions = new Set();

// Clear old sessions on startup to prevent false positives
console.log('🔄 Initializing submit route - clearing old sessions');

// Generate unique session ID
function generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
}

function checkRateLimit(ip) {
    const now = Date.now();
    const attempts = voteAttempts.get(ip) || [];
    
    // Remove attempts older than 1 minute
    const recentAttempts = attempts.filter(time => (now - time) < 60000);
    
    // Allow max 10 votes per minute per IP
    if (recentAttempts.length >= 10) {
        return false;
    }
    
    recentAttempts.push(now);
    voteAttempts.set(ip, recentAttempts);
    
    // Cleanup old entries
    for (const [ipKey, attemptTimes] of voteAttempts.entries()) {
        const validTimes = attemptTimes.filter(time => (now - time) < 3600000); // Keep 1 hour
        if (validTimes.length === 0) {
            voteAttempts.delete(ipKey);
        } else {
            voteAttempts.set(ipKey, validTimes);
        }
    }
    
    return true;
}

// Handle vote submission
router.get('/:teamId', async (req, res) => {
    try {
        console.log('🔍 Submit route called for team:', req.params.teamId);
        console.log('🔍 Full query params:', req.query);
        
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).render('error', {
                error: { status: 404, message: 'Không tìm thấy đội thi' }
            });
        }

        const currentTime = new Date();
        const sessionId = req.query.session;
        
        console.log('🔍 Session ID:', sessionId);
        console.log('🔍 Used sessions count:', usedSessions.size);
        console.log('🔍 Session already used?', usedSessions.has(sessionId));
        
        // Debug: Show some used sessions for comparison
        if (usedSessions.size > 0) {
            const usedArray = Array.from(usedSessions).slice(0, 3);
            console.log('🔍 Sample used sessions:', usedArray);
        }
        
        // Check if this team's voting session is active and not expired
        if (!team.votingActive || !team.votingEndTime) {
            console.log('❌ Team voting session not started yet - showing voting_closed page');
            return res.render('voting_closed');
        }
        
        if (currentTime > team.votingEndTime) {
            console.log('❌ Team voting time expired - auto-updating status and showing voting_closed page');
            // Auto-update team voting status to inactive when time expires
            team.votingActive = false;
            await team.save();
            return res.render('voting_closed');
        }

        // Check if session already used (reload detection)
        if (!sessionId) {
            console.log('⚠️ No session ID - likely direct access, showing message to scan QR');
            return res.render('submit', { 
                team: team,
                alreadyVoted: true,
                noSession: true,
                isReload: false,
                votingEndTime: team.votingEndTime
            });
        }

        if (usedSessions.has(sessionId)) {
            console.log('⚠️ Session already used - this is a reload/refresh, showing reload message');
            return res.render('submit', { 
                team: team,
                alreadyVoted: true,
                noSession: false,
                isReload: true,
                votingEndTime: team.votingEndTime
            });
        }
        
        console.log(`✅ Team ${team.name} voting is active until: ${team.votingEndTime}`);

        // Get client IP
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        
        // Check rate limit
        if (!checkRateLimit(clientIP)) {
            return res.status(429).render('error', {
                error: { 
                    status: 429, 
                    message: 'Bạn đã bình chọn quá nhiều. Vui lòng đợi một chút trước khi bình chọn tiếp.' 
                }
            });
        }

        // Save vote and mark session as used
        const vote = new Vote({
            teamId: req.params.teamId,
            ip: clientIP
        });
        await vote.save();

        // Mark session as used to prevent reload spam
        usedSessions.add(sessionId);
        
        // Cleanup old sessions periodically (keep last 1000)
        if (usedSessions.size > 1000) {
            const sessionsArray = Array.from(usedSessions);
            const oldSessions = sessionsArray.slice(0, 500);
            oldSessions.forEach(session => usedSessions.delete(session));
        }

        console.log(`✅ Vote recorded: ${team.name} from ${clientIP}, session: ${sessionId}`);

        // Emit real-time update
        const io = req.app.get('socketio');
        if (io) {
            io.emit('voteUpdate', {
                teamId: req.params.teamId,
                teamName: team.name,
                timestamp: new Date()
            });
        }

        // Get vote duration config for countdown
        let config = await Config.findOne({ key: 'voteDuration' });
        if (!config) {
            config = new Config({
                key: 'voteDuration',
                value: 5 // 5 minutes default
            });
            await config.save();
        }

        res.render('submit', { 
            team: team,
            alreadyVoted: false,
            noSession: false,
            isReload: false,
            voteSuccess: true,
            voteDuration: config.value * 60 * 1000, // Convert minutes to milliseconds for JavaScript
            votingEndTime: team.votingEndTime // Use team-specific end time
        });
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).render('error', {
            error: { status: 500, message: 'Lỗi khi ghi nhận bình chọn' }
        });
    }
});

module.exports = router;
