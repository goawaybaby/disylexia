const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getProfile, 
    logoutUser, 
    saveScore, 
    saveImage,  // Import the saveImage function
    authenticateToken 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getProfile); // Profile route with middleware
router.post('/logout', logoutUser);
router.post('/save-score', authenticateToken, saveScore);
router.post('/save-image', authenticateToken, saveImage); // Add the save-image route

module.exports = router;





