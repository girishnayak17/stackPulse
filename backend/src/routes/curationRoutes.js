const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { 
    saveComparison, 
    getSavedComparisons, 
    pinRepository, 
    getUserPins 
} = require('../controllers/curationController');

// All curation routes require a logged-in user session (JWT)
router.post('/comparisons', verifyToken, saveComparison);
router.get('/comparisons', verifyToken, getSavedComparisons);
router.post('/pins', verifyToken, pinRepository);
router.get('/pins', verifyToken, getUserPins);

module.exports = router;