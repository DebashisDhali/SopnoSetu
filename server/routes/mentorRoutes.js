const express = require('express');
const router = express.Router();
const { getMentors, getMentorById, updateMyProfile, getMyProfile, createReview } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getMentors);
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/review', protect, createReview);
router.get('/:id', getMentorById);

module.exports = router;
