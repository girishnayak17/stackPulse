const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { 
    saveComparison, 
    getSavedComparisons, 
    deleteComparison, 
    pinRepository, 
    getUserPins, 
    deletePin 
} = require('../controllers/curationController');

// Comparison Routes
router.post('/comparisons', verifyToken, saveComparison);
router.get('/comparisons', verifyToken, getSavedComparisons);
router.delete('/comparisons/:id', verifyToken, deleteComparison);

// Pinned Repository Routes
router.post('/pins', verifyToken, pinRepository);
router.get('/pins', verifyToken, getUserPins);
router.delete('/pins/:repo_id', verifyToken, deletePin);

module.exports = router;