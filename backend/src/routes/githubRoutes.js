const express = require('express');
const router = express.Router();
const { getDeveloperProfile } = require('../controllers/githubController');

router.get('/profile/:username', getDeveloperProfile);

module.exports = router;