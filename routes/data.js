const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const Vote = require('../models/vote');
const Config = require('../models/config');

// Export data
router.get('/export', async (req, res) => {
    try {
        const teams = await Team.find();
        const votes = await Vote.find().populate('teamId');
        const configs = await Config.find();
        
        const exportData = {
            timestamp: new Date(),
            teams: teams,
            votes: votes,
            configs: configs,
            summary: {
                totalTeams: teams.length,
                totalVotes: votes.length,
                totalConfigs: configs.length
            }
        };
        
        res.setHeader('Content-Disposition', 'attachment; filename=voting-data-export.json');
        res.setHeader('Content-Type', 'application/json');
        res.json(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Lỗi khi export dữ liệu' });
    }
});

// Import data (admin only)
router.post('/import', async (req, res) => {
    try {
        const { teams, votes, configs, replaceExisting } = req.body;
        
        if (replaceExisting) {
            await Team.deleteMany({});
            await Vote.deleteMany({});
            await Config.deleteMany({});
        }
        
        if (teams && teams.length > 0) {
            await Team.insertMany(teams);
        }
        
        if (configs && configs.length > 0) {
            await Config.insertMany(configs);
        }
        
        if (votes && votes.length > 0) {
            await Vote.insertMany(votes);
        }
        
        console.log('✅ Data imported successfully');
        res.json({ success: true, message: 'Import thành công' });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Lỗi khi import dữ liệu' });
    }
});

module.exports = router;
