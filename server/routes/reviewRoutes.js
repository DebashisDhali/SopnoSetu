const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createReview,
    getMentorReviews,
    getMyReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (Candidate only)
router.post('/', protect, createReview);

// @route   GET /api/reviews/mentor/:mentorId
// @desc    Get all reviews for a specific mentor
// @access  Public
router.get('/mentor/:mentorId', getMentorReviews);

// @route   GET /api/reviews/my-reviews
// @desc    Get my reviews (as a candidate)
// @access  Private (Candidate)
router.get('/my-reviews', protect, getMyReviews);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Candidate - own reviews only)
router.put('/:id', protect, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Candidate - own reviews only)
router.delete('/:id', protect, deleteReview);

module.exports = router;
