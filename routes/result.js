const express = require('express');
const router = express.Router();
const Vote = require('../models/vote');
const Team = require('../models/team');

// Get results page
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find();
        res.render('result', { teams: teams });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// API endpoint to get vote data for charts
router.get('/api/data', async (req, res) => {
    try {
        console.log('🔍 Result API called');
        
        // Get all teams
        const allTeams = await Team.find().sort({ name: 1 });
        console.log(`📊 Found ${allTeams.length} teams`);
        
        // Get vote counts for each team
        const result = await Promise.all(allTeams.map(async (team) => {
            const voteCount = await Vote.countDocuments({ teamId: team._id });
            console.log(`🗳️ Team ${team.name}: ${voteCount} votes`);
            return {
                teamName: team.name,
                count: voteCount
            };
        }));
        
        const totalVotes = result.reduce((sum, team) => sum + team.count, 0);
        console.log(`📈 Total votes: ${totalVotes}`);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Result API error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
