const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const Session = require('../models/Session');
const Review = require('../models/Review');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
const getMentors = async (req, res) => {
    try {
        let searchKeyword = req.query.keyword;
        if (Array.isArray(searchKeyword)) {
            searchKeyword = searchKeyword[0];
        }

        const keyword = searchKeyword
            ? {
                $or: [
                    { university: { $regex: searchKeyword, $options: 'i' } },
                    { department: { $regex: searchKeyword, $options: 'i' } },
                ],
            }
            : {};

        const mentors = await MentorProfile.find(keyword).populate('user', 'name email verified isMentorVerified role profilePic');
        
        // Only return mentors who are verified
        const verifiedMentors = mentors.filter(mentor => mentor.user && mentor.user.isMentorVerified);

        res.json(verifiedMentors);
    } catch (error) {
        console.error("GET MENTORS ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
const getMentorById = async (req, res) => {
    try {
        // Check if ID is a valid ObjectId
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
             return res.status(404).json({ message: 'Mentor not found' });
        }
        
        let mentor = await MentorProfile.findById(req.params.id).populate('user', 'name email verified role profilePic');

        // If not found by Profile ID, try finding by User ID
        if (!mentor) {
            mentor = await MentorProfile.findOne({ user: req.params.id }).populate('user', 'name email verified role profilePic');
        }

        if (mentor) {
            // Fetch reviews for this mentor
            const reviews = await Review.find({ mentor: mentor.user._id })
                .populate('candidate', 'name profilePic')
                .sort({ createdAt: -1 })
                .limit(5);

            // Fetch upcoming sessions to check availability
            const upcomingSessions = await Session.find({
                mentor: mentor.user._id,
                startTime: { $gte: new Date() }, // Future sessions only
                status: { $in: ['pending', 'accepted', 'approved'] }
            }).select('startTime slotId');

            res.json({ ...mentor.toObject(), reviews, upcomingSessions });
        } else {
            res.status(404).json({ message: 'Mentor not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update my mentor profile
// @route   PUT /api/mentors/me
// @access  Private (Mentor)
const updateMyProfile = async (req, res) => {
    const { bio, hourlyRate, expertise, university, department, universityEmail, availability, meetingLink, paymentMethods, paymentNumber, profilePic } = req.body;

    try {
        const mentorProfile = await MentorProfile.findOne({ user: req.user._id });

        if (mentorProfile) {
            mentorProfile.bio = bio || mentorProfile.bio;
            mentorProfile.hourlyRate = hourlyRate || mentorProfile.hourlyRate;
            mentorProfile.expertise = expertise || mentorProfile.expertise;
            mentorProfile.university = university || mentorProfile.university;
            mentorProfile.department = department || mentorProfile.department;
            mentorProfile.universityEmail = universityEmail || mentorProfile.universityEmail;
            mentorProfile.availability = availability || mentorProfile.availability;
            mentorProfile.meetingLink = meetingLink !== undefined ? meetingLink : mentorProfile.meetingLink;
            mentorProfile.paymentMethods = paymentMethods !== undefined ? paymentMethods : mentorProfile.paymentMethods;
            mentorProfile.paymentNumber = paymentNumber !== undefined ? paymentNumber : mentorProfile.paymentNumber;

            await mentorProfile.save();

            // Update all upcoming sessions with the new meeting link
            if (meetingLink !== undefined) {
                await Session.updateMany(
                    { mentor: req.user._id, status: { $in: ['accepted', 'approved'] } },
                    { meetingLink: meetingLink }
                );
            }

            // Update user model fields if provided
            const userUpdate = {};
            if (req.body.studentIdUrl) userUpdate.studentIdUrl = req.body.studentIdUrl;
            if (profilePic !== undefined) userUpdate.profilePic = profilePic;
            if (bio !== undefined) userUpdate.bio = bio; // Store bio in User model too

            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(req.user._id, userUpdate);
            }

            const updatedProfile = await MentorProfile.findOne({ user: req.user._id }).populate('user', 'name email studentIdUrl profilePic bio');
            res.json(updatedProfile);
        } else {
            res.status(404).json({ message: 'Mentor profile not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my profile
// @route   GET /api/mentors/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        const mentorProfile = await MentorProfile.findOne({ user: req.user._id }).populate('user', 'name email studentIdUrl isMentorVerified profilePic');
        if (mentorProfile) {
            res.json(mentorProfile);
        } else {
            res.status(404).json({ message: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new review
// @route   POST /api/mentors/review
// @access  Private (Candidate)
const createReview = async (req, res) => {
    const { mentorId, rating, comment, sessionId } = req.body;

    try {
        if (req.user.role !== 'candidate') {
            return res.status(403).json({ message: 'Only students can leave reviews' });
        }

        const review = await Review.create({
            mentor: mentorId,
            candidate: req.user._id,
            rating: Number(rating),
            comment,
            session: sessionId
        });

        // Update MentorProfile rating and reviewsCount
        const mentorProfile = await MentorProfile.findOne({ user: mentorId });
        if (mentorProfile) {
            const reviews = await Review.find({ mentor: mentorId });
            mentorProfile.reviewsCount = reviews.length;
            mentorProfile.rating = (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1);
            await mentorProfile.save();
        }

        res.status(201).json(review);
    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);
        res.status(400).json({ message: error.message || 'Failed to create review' });
    }
};

module.exports = {
    getMentors,
    getMentorById,
    updateMyProfile,
    getMyProfile,
    createReview
};
