const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getMentorApplications, 
    verifyMentor, 
    unverifyMentor, 
    declineMentorApplication,
    getPlatformStats,
    getTransactions,
    processPayout,
    updateSettings,
    getSettings 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.get('/mentor-applications', protect, admin, getMentorApplications);
router.put('/verify-mentor/:id', protect, admin, verifyMentor);
router.put('/unverify-mentor/:id', protect, admin, unverifyMentor);
router.delete('/decline-mentor/:id', protect, admin, declineMentorApplication);
router.get('/stats', protect, admin, getPlatformStats);
router.get('/transactions', protect, admin, getTransactions);
router.post('/payout/:mentorId', protect, admin, processPayout);
router.put('/settings', protect, admin, updateSettings);
router.get('/settings', getSettings);

module.exports = router;
