const pool = require('../config/db');

// Save a new developer comparison
const saveComparison = async (req, res) => {
    const userId = req.user.id;
    const { name, usernames } = req.body;

    if (!name || !usernames || usernames.length === 0) {
        return res.status(400).json({ error: 'Comparison name and developer usernames are required' });
    }

    try {
        const compResult = await pool.query(
            'INSERT INTO comparisons (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
            [userId, name]
        );
        const comparisonId = compResult.rows[0].id;

        for (const username of usernames) {
            const devResult = await pool.query('SELECT id FROM developers WHERE github_username = $1', [username]);
            if (devResult.rows.length > 0) {
                const developerId = devResult.rows[0].id;
                await pool.query(
                    'INSERT INTO comparison_devs (comparison_id, developer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [comparisonId, developerId]
                );
            }
        }

        res.status(201).json({
            message: 'Comparison saved successfully',
            comparison: compResult.rows[0]
        });
    } catch (err) {
        console.error('Save comparison error:', err.message);
        res.status(500).json({ error: 'Failed to save comparison' });
    }
};

// Get all saved comparisons along with their associated developer usernames
const getSavedComparisons = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT c.id, c.name, c.created_at, 
                   array_agg(d.github_username) as usernames
            FROM comparisons c
            LEFT JOIN comparison_devs cd ON c.id = cd.comparison_id
            LEFT JOIN developers d ON cd.developer_id = d.id
            WHERE c.user_id = $1
            GROUP BY c.id, c.name, c.created_at
            ORDER BY c.created_at DESC;
        `;
        const comparisons = await pool.query(query, [userId]);

        res.json({ success: true, comparisons: comparisons.rows });
    } catch (err) {
        console.error('Fetch comparisons error:', err.message);
        res.status(500).json({ error: 'Failed to fetch comparisons' });
    }
};

// Delete a saved comparison
// Delete a saved comparison
const deleteComparison = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const compCheck = await pool.query('SELECT * FROM comparisons WHERE id = $1 AND user_id = $2', [id, userId]);
        if (compCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Comparison not found' });
        }

        // 1. Delete associated child rows in comparison_devs first to avoid foreign key violations
        await pool.query('DELETE FROM comparison_devs WHERE comparison_id = $1', [id]);

        // 2. Now delete the main comparison record
        await pool.query('DELETE FROM comparisons WHERE id = $1', [id]);

        res.json({ message: 'Comparison deleted successfully' });
    } catch (err) {
        console.error('Delete comparison error:', err.message);
        res.status(500).json({ error: 'Failed to delete comparison' });
    }
};

// Pin or update note/tags on a repository
const pinRepository = async (req, res) => {
    const userId = req.user.id;
    const { repo_id, note, tags } = req.body;

    if (!repo_id) {
        return res.status(400).json({ error: 'Repository ID is required' });
    }

    try {
        const pinQuery = `
            INSERT INTO pins (user_id, repo_id, note, tags)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, repo_id)
            DO UPDATE SET note = $3, tags = $4
            RETURNING *;
        `;
        const result = await pool.query(pinQuery, [userId, repo_id, note, tags]);

        res.json({
            message: 'Repository pinned successfully',
            pin: result.rows[0]
        });
    } catch (err) {
        console.error('Pin repo error:', err.message);
        res.status(500).json({ error: 'Failed to pin repository' });
    }
};

// Get all pins/notes for the logged-in user
const getUserPins = async (req, res) => {
    const userId = req.user.id;

    try {
        const pinsQuery = `
            SELECT p.*, r.name as repo_name, r.stars, r.primary_language, d.github_username 
            FROM pins p
            JOIN repos r ON p.repo_id = r.id
            JOIN developers d ON r.developer_id = d.id
            WHERE p.user_id = $1;
        `;
        const result = await pool.query(pinsQuery, [userId]);

        res.json({ success: true, pins: result.rows });
    } catch (err) {
        console.error('Fetch pins error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pinned repositories' });
    }
};

// Delete a pinned repository
// Delete a pinned repository
const deletePin = async (req, res) => {
    const userId = req.user.id;
    const repoId = parseInt(req.params.repo_id, 10); // Ensure repo_id is parsed as an integer

    if (isNaN(repoId)) {
        return res.status(400).json({ error: 'Invalid repository ID' });
    }

    try {
        // Check if the pin exists for this user
        const pinCheck = await pool.query(
            'SELECT * FROM pins WHERE user_id = $1 AND repo_id = $2', 
            [userId, repoId]
        );
        
        if (pinCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Pin not found' });
        }

        // Delete the pin
        await pool.query(
            'DELETE FROM pins WHERE user_id = $1 AND repo_id = $2', 
            [userId, repoId]
        );

        res.json({ message: 'Pin removed successfully' });
    } catch (err) {
        console.error('Delete pin error:', err.message);
        res.status(500).json({ error: 'Failed to remove pin' });
    }
};

module.exports = { 
    saveComparison, 
    getSavedComparisons, 
    deleteComparison, 
    pinRepository, 
    getUserPins, 
    deletePin 
};