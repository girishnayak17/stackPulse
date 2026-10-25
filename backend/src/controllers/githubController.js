const axios = require('axios');
const pool = require('../config/db');

// Helper to get GitHub headers
const getGitHubHeaders = () => {
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) {
        headers.authorization = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
};

// Fetch GitHub Developer Profile & Repositories
const getDeveloperProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
            headers: getGitHubHeaders()
        });

        const userData = userResponse.data;
        const avatarUrl = userData.avatar_url;
        const followers = userData.followers;
        const publicRepos = userData.public_repos;

        const devQuery = `
            INSERT INTO developers (github_username, avatar_url, followers, public_repos, fetched_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (github_username) 
            DO UPDATE SET avatar_url = $2, followers = $3, public_repos = $4, fetched_at = NOW()
            RETURNING id;
        `;
        const devResult = await pool.query(devQuery, [username, avatarUrl, followers, publicRepos]);
        const developerId = devResult.rows[0].id;

        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
            headers: getGitHubHeaders()
        });

        const reposData = reposResponse.data;

        let totalStars = 0;
        const languageCounts = {};

        for (const repo of reposData) {
            const repoName = repo.name;
            const stars = repo.stargazers_count || 0;
            const primaryLanguage = repo.language || 'Unknown';
            const pushedDate = repo.pushed_at || null;

            totalStars += stars;

            if (primaryLanguage !== 'Unknown') {
                languageCounts[primaryLanguage] = (languageCounts[primaryLanguage] || 0) + 1;
            }

            const repoQuery = `
                INSERT INTO repos (developer_id, name, stars, primary_language, pushed_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (developer_id, name)
                DO UPDATE SET stars = $3, primary_language = $4, pushed_at = $5;
            `;
            await pool.query(repoQuery, [developerId, repoName, stars, primaryLanguage, pushedDate]);
        }

        const dbRepos = await pool.query(
            'SELECT * FROM repos WHERE developer_id = $1 ORDER BY stars DESC',
            [developerId]
        );

        res.json({
            success: true,
            developer: {
                username,
                avatar_url: avatarUrl,
                followers,
                public_repos: publicRepos,
                total_stars: totalStars,
                languages: languageCounts
            },
            repositories: dbRepos.rows
        });

    } catch (err) {
        console.error('GitHub API error:', err.response?.data || err.message);
        if (err.response?.status === 404) {
            return res.status(404).json({ error: 'GitHub developer not found' });
        }
        res.status(500).json({ error: 'Failed to fetch developer data from GitHub' });
    }
};

module.exports = { getDeveloperProfile };