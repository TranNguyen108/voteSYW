const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const Vote = require('../models/vote');
const Config = require('../models/config');

// Get admin page
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Admin route called');
        const teams = await Team.find().sort({ createdAt: -1 });
        console.log(`📊 Found ${teams.length} teams`);
        
        // Get vote counts for each team
        const teamsWithVotes = await Promise.all(teams.map(async (team) => {
            const voteCount = await Vote.countDocuments({ teamId: team._id });
            return {
                ...team.toObject(),
                voteCount: voteCount
            };
        }));
        
        // Get total votes
        const totalVotes = await Vote.countDocuments();
        
        let config = await Config.findOne({ key: 'voteDuration' });
        console.log('⚙️ Config found:', config);
        
        if (!config) {
            config = new Config({
                key: 'voteDuration',
                value: 5 // 5 minutes default
            });
            await config.save();
            console.log('⚙️ Created default config');
        }
        
        const data = { 
            teams: teamsWithVotes,
            totalVotes: totalVotes,
            voteDuration: config.value // Already in minutes
        };
        console.log('📤 Rendering admin with data:', data);
        
        res.render('admin', data);
    } catch (error) {
        console.error('❌ Admin route error:', error);
        res.status(500).send('Server Error: ' + error.message);
    }
});

// Add new team
router.post('/teams', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).send('Tên đội không được để trống');
        }
        
        if (name.trim().length > 100) {
            return res.status(400).send('Tên đội không được quá 100 ký tự');
        }
        
        // Check if team name already exists
        const existingTeam = await Team.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
        });
        
        if (existingTeam) {
            return res.status(400).send('Tên đội đã tồn tại');
        }
        
        const team = new Team({ 
            name: name.trim(), 
            description: description ? description.trim() : '' 
        });
        await team.save();
        
        console.log(`✅ New team added: ${team.name}`);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding team:', error);
        res.status(500).send('Lỗi khi thêm đội thi');
    }
});

// Update team
router.post('/teams/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).send('Tên đội không được để trống');
        }
        
        if (name.trim().length > 100) {
            return res.status(400).send('Tên đội không được quá 100 ký tự');
        }
        
        // Check if team name already exists (exclude current team)
        const existingTeam = await Team.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            _id: { $ne: req.params.id }
        });
        
        if (existingTeam) {
            return res.status(400).send('Tên đội đã tồn tại');
        }
        
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id, 
            { 
                name: name.trim(), 
                description: description ? description.trim() : '' 
            },
            { new: true }
        );
        
        if (!updatedTeam) {
            return res.status(404).send('Không tìm thấy đội thi');
        }
        
        console.log(`✅ Team updated: ${updatedTeam.name}`);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).send('Lỗi khi cập nhật đội thi');
    }
});

// Delete team
router.post('/teams/:id/delete', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).send('Không tìm thấy đội thi');
        }
        
        // Delete all votes for this team first
        const deletedVotes = await Vote.deleteMany({ teamId: req.params.id });
        
        // Then delete the team
        await Team.findByIdAndDelete(req.params.id);
        
        console.log(`✅ Team deleted: ${team.name} (${deletedVotes.deletedCount} votes removed)`);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).send('Lỗi khi xóa đội thi');
    }
});

// Update vote duration
router.post('/config', async (req, res) => {
    try {
        const { voteDuration } = req.body;
        
        // Validation
        const duration = parseInt(voteDuration);
        if (isNaN(duration) || duration < 1 || duration > 60) {
            return res.status(400).send('Thời gian bình chọn phải từ 1 đến 60 phút');
        }
        
        await Config.findOneAndUpdate(
            { key: 'voteDuration' },
            { value: duration, updatedAt: new Date() }, // Store directly in minutes
            { upsert: true }
        );
        
        console.log(`✅ Vote duration updated: ${duration} minutes`);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).send('Lỗi khi cập nhật cấu hình');
    }
});

// Reset all votes
router.post('/reset-votes', async (req, res) => {
    try {
        const result = await Vote.deleteMany({});
        
        console.log(`✅ All votes reset: ${result.deletedCount} votes deleted`);
        
        // Emit socket event for real-time update
        const io = req.app.get('socketio');
        if (io) {
            io.emit('voteReset');
        }
        
        res.redirect('/admin');
    } catch (error) {
        console.error('Error resetting votes:', error);
        res.status(500).send('Lỗi khi reset votes');
    }
});

// Get vote statistics for admin
router.get('/api/stats', async (req, res) => {
    try {
        const totalVotes = await Vote.countDocuments();
        const uniqueIPs = await Vote.distinct('ip');
        const votesByTeam = await Vote.aggregate([
            {
                $group: {
                    _id: '$teamId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'team'
                }
            },
            {
                $unwind: '$team'
            },
            {
                $project: {
                    teamName: '$team.name',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.json({
            totalVotes,
            uniqueVoters: uniqueIPs.length,
            votesByTeam
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Export all data
router.get('/export', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 });
        const votes = await Vote.find().populate('teamId', 'name').sort({ timestamp: -1 });
        const config = await Config.findOne({ key: 'voteDuration' });

        const exportData = {
            timestamp: new Date().toISOString(),
            config: config ? config.value : 5, // Already in minutes
            teams: teams,
            votes: votes.map(vote => ({
                teamName: vote.teamId ? vote.teamId.name : 'Unknown',
                ip: vote.ip,
                timestamp: vote.timestamp
            })),
            summary: {
                totalTeams: teams.length,
                totalVotes: votes.length,
                uniqueVoters: [...new Set(votes.map(v => v.ip))].length
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=voting_data_${Date.now()}.json`);
        res.json(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Export failed' });
    }
});

// Import data
router.post('/import', async (req, res) => {
    try {
        const { teams, config } = req.body;

        if (teams && Array.isArray(teams)) {
            await Team.deleteMany({});
            await Team.insertMany(teams.map(team => ({
                name: team.name,
                description: team.description || '',
                createdAt: team.createdAt || new Date()
            })));
        }

        if (config && typeof config === 'number') {
            await Config.findOneAndUpdate(
                { key: 'voteDuration' },
                { value: config, updatedAt: new Date() },
                { upsert: true }
            );
        }

        res.json({ success: true, message: 'Data imported successfully' });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Import failed' });
    }
});

// Get detailed analytics
router.get('/analytics', async (req, res) => {
    try {
        const teams = await Team.find();
        const votes = await Vote.find().populate('teamId', 'name');

        // Votes by team
        const votesByTeam = {};
        teams.forEach(team => {
            votesByTeam[team._id] = {
                teamName: team.name,
                count: 0,
                votes: []
            };
        });

        votes.forEach(vote => {
            if (vote.teamId && votesByTeam[vote.teamId._id]) {
                votesByTeam[vote.teamId._id].count++;
                votesByTeam[vote.teamId._id].votes.push({
                    ip: vote.ip,
                    timestamp: vote.timestamp
                });
            }
        });

        // Votes by hour
        const votesByHour = {};
        votes.forEach(vote => {
            const hour = new Date(vote.timestamp).getHours();
            votesByHour[hour] = (votesByHour[hour] || 0) + 1;
        });

        // Unique voters
        const uniqueVoters = [...new Set(votes.map(v => v.ip))];

        // Top voters
        const voterCounts = {};
        votes.forEach(vote => {
            voterCounts[vote.ip] = (voterCounts[vote.ip] || 0) + 1;
        });

        const topVoters = Object.entries(voterCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([ip, count]) => ({ ip, count }));

        res.json({
            totalVotes: votes.length,
            totalTeams: teams.length,
            uniqueVoters: uniqueVoters.length,
            votesByTeam: Object.values(votesByTeam).sort((a, b) => b.count - a.count),
            votesByHour,
            topVoters,
            recentVotes: votes.slice(-20).reverse().map(vote => ({
                teamName: vote.teamId ? vote.teamId.name : 'Unknown',
                ip: vote.ip,
                timestamp: vote.timestamp
            }))
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

// Bulk operations
router.post('/teams/bulk-delete', async (req, res) => {
    try {
        const { teamIds } = req.body;
        
        if (!Array.isArray(teamIds) || teamIds.length === 0) {
            return res.status(400).json({ error: 'Invalid team IDs' });
        }

        // Delete votes for these teams
        await Vote.deleteMany({ teamId: { $in: teamIds } });
        
        // Delete teams
        const result = await Team.deleteMany({ _id: { $in: teamIds } });

        console.log(`🗑️ Bulk deleted ${result.deletedCount} teams`);
        res.json({ 
            success: true, 
            message: `Deleted ${result.deletedCount} teams and their votes` 
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ error: 'Bulk delete failed' });
    }
});

// Get stats API for real-time updates
router.get('/api/stats', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: -1 });
        const totalVotes = await Vote.countDocuments();
        
        // Get vote counts for each team
        const teamStats = await Promise.all(teams.map(async (team) => {
            const voteCount = await Vote.countDocuments({ teamId: team._id });
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
            return {
                id: team._id,
                name: team.name,
                voteCount: voteCount,
                percentage: percentage
            };
        }));
        
        // Sort by vote count
        teamStats.sort((a, b) => b.voteCount - a.voteCount);
        
        res.json({
            success: true,
            totalVotes: totalVotes,
            totalTeams: teams.length,
            totalVoters: await Vote.distinct('ip').then(ips => ips.length),
            teamStats: teamStats,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;
