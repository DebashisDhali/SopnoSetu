const Review = require('../models/Review');
const Session = require('../models/Session');
const MentorProfile = require('../models/MentorProfile');
const { createNotification } = require('./notificationController');

// @desc    Create a review for a mentor
// @route   POST /api/reviews
// @access  Private (Candidate only)
const createReview = async (req, res) => {
    try {
        const { mentorId, sessionId, rating, comment } = req.body;

        // Only candidates can create reviews
        if (req.user.role !== 'candidate') {
            return res.status(403).json({ message: 'Only students can create reviews' });
        }

        // Validate required fields
        if (!mentorId || !rating || !comment) {
            return res.status(400).json({ message: 'Please provide mentor, rating, and comment' });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // If sessionId is provided, verify the session exists and is completed
        if (sessionId) {
            const session = await Session.findById(sessionId);
            
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            // Verify the session belongs to this candidate
            if (session.candidate.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only review your own sessions' });
            }

            // Verify the session is completed
            if (session.status !== 'completed') {
                return res.status(400).json({ message: 'You can only review completed sessions' });
            }

            // Check if review already exists for this session
            const existingReview = await Review.findOne({ session: sessionId });
            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this session' });
            }
        }

        // Create the review
        const review = await Review.create({
            mentor: mentorId,
            candidate: req.user._id,
            rating,
            comment,
            session: sessionId || null
        });

        // Update mentor's rating and review count
        await updateMentorRating(mentorId);

        // Populate the review with candidate info
        const seededReview = await Review.findById(review._id)
            .populate('candidate', 'name email')
            .populate('mentor', 'name email');

        // Notify Mentor
        await createNotification({
            recipient: mentorId,
            sender: req.user._id,
            type: 'review_received',
            title: 'New Review Received',
            message: `${req.user.name} has left a ${rating}-star review for you.`,
            link: '/dashboard?view=reviews'
        });

        res.status(201).json(seededReview);
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ message: error.message || 'Failed to create review' });
    }
};

// @desc    Get reviews for a specific mentor
// @route   GET /api/reviews/mentor/:mentorId
// @access  Public
const getMentorReviews = async (req, res) => {
    try {
        const { mentorId } = req.params;

        const reviews = await Review.find({ mentor: mentorId })
            .populate('candidate', 'name email')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Get Mentor Reviews Error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// @desc    Get my reviews (as a candidate)
// @route   GET /api/reviews/my-reviews
// @access  Private (Candidate)
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ candidate: req.user._id })
            .populate('mentor', 'name email')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Get My Reviews Error:', error);
        res.status(500).json({ message: 'Failed to fetch your reviews' });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Candidate - own reviews only)
const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify the review belongs to this candidate
        if (review.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own reviews' });
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Update fields
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        // Update mentor's rating
        await updateMentorRating(review.mentor);

        const updatedReview = await Review.findById(review._id)
            .populate('candidate', 'name email')
            .populate('mentor', 'name email');

        res.json(updatedReview);
    } catch (error) {
        console.error('Update Review Error:', error);
        res.status(500).json({ message: 'Failed to update review' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Candidate - own reviews only)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify the review belongs to this candidate
        if (review.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own reviews' });
        }

        const mentorId = review.mentor;
        await review.deleteOne();

        // Update mentor's rating after deletion
        await updateMentorRating(mentorId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ message: 'Failed to delete review' });
    }
};

// Helper function to update mentor's average rating and review count
const updateMentorRating = async (mentorId) => {
    try {
        const reviews = await Review.find({ mentor: mentorId });
        const reviewCount = reviews.length;
        
        let averageRating = 0;
        if (reviewCount > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviewCount;
        }

        await MentorProfile.findOneAndUpdate(
            { user: mentorId },
            {
                rating: averageRating,
                reviewsCount: reviewCount
            }
        );
    } catch (error) {
        console.error('Update Mentor Rating Error:', error);
    }
};

module.exports = {
    createReview,
    getMentorReviews,
    getMyReviews,
    updateReview,
    deleteReview
};
