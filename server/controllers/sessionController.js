const Session = require('../models/Session');
const User = require('../models/User');
const Payment = require('../models/Payment');
const MentorProfile = require('../models/MentorProfile');
const Settings = require('../models/Settings');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

// @desc    Book a new session
// @route   POST /api/sessions
// @access  Private (Candidate)
const bookSession = async (req, res) => {
    const { mentorId, startTime, duration, notes, paymentMethod, transactionId, amount, slotId } = req.body;

    // 0. Only candidates can book sessions
    if (req.user.role !== 'candidate') {
        return res.status(403).json({ message: 'Only students can book mentoring sessions.' });
    }

    try {
        const mentorProfile = await MentorProfile.findOne({ user: mentorId });
        if (!mentorProfile) {
            return res.status(404).json({ message: 'Mentor profile not found' });
        }

        const settings = await Settings.findOne() || { 
            monthlyMentorLimit: 2, 
            yearlyMentorLimit: 5, 
            monthlySessionLimit: 10, 
            yearlySessionLimit: 100 
        };

        // 1.5 Handle Subscription Logic
        let isSubscriptionBooking = false;
        const now = new Date();

        if (req.user.subscriptionPlan !== 'free' && req.user.subscriptionExpires > now) {
            const isSubscribedMentor = req.user.subscribedMentors?.some(id => id.toString() === mentorId);
            
            if (isSubscribedMentor) {
                const limit = req.user.subscriptionPlan === 'monthly' ? settings.monthlySessionLimit : settings.yearlySessionLimit;
                
                if (req.user.sessionsUsed < limit) {
                    isSubscriptionBooking = true;
                } else {
                    // Plan limit reached, must pay or wait
                    return res.status(403).json({ message: `You have reached your ${req.user.subscriptionPlan} session limit.` });
                }
            }
        }

        // Check if slot exists in availability
        const slot = mentorProfile.availability.find(s => s._id.toString() === slotId);
        if (!slot) {
            return res.status(400).json({ message: 'Invalid or missing availability slot' });
        }

        // 1.8 Slot Blocking Check
        const existingSession = await Session.findOne({
            mentor: mentorId,
            startTime,
            status: { $in: ['pending', 'accepted', 'approved', 'completed'] }
        });

        if (existingSession) {
            return res.status(400).json({ message: 'This time slot is already booked. Please choose another slot.' });
        }

        // 2. Create Session
        const newBooking = await Session.create({
            candidate: req.user._id,
            mentor: mentorId,
            startTime,
            duration,
            notes,
            paymentStatus: (transactionId || isSubscriptionBooking) ? 'paid' : 'unpaid',
            status: isSubscriptionBooking ? 'accepted' : 'pending',
            amount: isSubscriptionBooking ? 0 : (amount || 0),
            slotId: slotId,
            isSubscription: isSubscriptionBooking
        });

        if (isSubscriptionBooking) {
            await User.findByIdAndUpdate(req.user._id, { $inc: { sessionsUsed: 1 } });
            
            // For subscription sessions, we still record a 0 amount payment for history
            await Payment.create({
                user: req.user._id,
                mentor: mentorId,
                amount: 0,
                transactionId: `SUB-${newBooking._id}`,
                paymentMethod: 'system',
                type: 'session_booking',
                status: 'completed',
                reference: newBooking._id
            });
        }

        // 2. Create Payment Record if details provided
        if (transactionId && amount) {
            const settings = await Settings.findOne() || { commissionRate: 20 };
            const commissionRate = settings.commissionRate / 100;
            const adminCommission = amount * commissionRate;
            const mentorAmount = amount - adminCommission;

            try {
                await Payment.create({
                    user: req.user._id,
                    mentor: mentorId,
                    amount,
                    mentorAmount,
                    adminCommission,
                    transactionId,
                    paymentMethod,
                    type: 'session_booking',
                    status: 'completed', 
                    reference: newBooking._id
                });

                // Add to mentor's due balance immediately as student has paid admin
                mentorProfile.walletBalance = (mentorProfile.walletBalance || 0) + mentorAmount;
                mentorProfile.earnings = (mentorProfile.earnings || 0) + mentorAmount;
                await mentorProfile.save();
            } catch (paymentError) {
                console.error("Payment creation failed, but session booked:", paymentError);
            }
        }

        // Notify Mentor
        await createNotification({
            recipient: mentorId,
            sender: req.user._id,
            type: 'session_request',
            title: 'New Session Request',
            message: `${req.user.name} has requested a session with you.`,
            link: '/dashboard?view=sessions'
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(400).json({ message: error.message || 'Booking failed' });
    }
};

// @desc    Get my sessions
// @route   GET /api/sessions
// @access  Private
const getMySessions = async (req, res) => {
    try {
        let sessions;
        if (req.user.role === 'mentor') {
            sessions = await Session.find({ mentor: req.user._id })
                .populate('candidate', '_id name email')
                .populate('mentor', '_id name email');
        } else {
            sessions = await Session.find({ candidate: req.user._id })
                .populate('mentor', '_id name email')
                .populate('candidate', '_id name email'); 
            
            // For each session, fetch the mentor's current profile link to be 100% sure
            const sessionsWithLinks = await Promise.all(sessions.map(async (session) => {
                const s = session.toObject();
                const mentorProfile = await MentorProfile.findOne({ user: s.mentor._id });
                if (mentorProfile && mentorProfile.meetingLink) {
                    s.mentorProfileLink = mentorProfile.meetingLink;
                }
                return s;
            }));
            return res.json(sessionsWithLinks);
        }
        res.json(sessions);
    } catch (error) {
        console.error("GET SESSIONS ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update session status
// @route   PUT /api/sessions/:id
// @access  Private (Mentor)
const updateSessionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Ensure only the assigned mentor can update
        if (session.mentor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        session.status = status;
        if (status === 'accepted') {
             // Use mentor's profile meeting link if available
             const mentorProfile = await MentorProfile.findOne({ user: req.user._id });
             session.meetingLink = mentorProfile?.meetingLink || "";
        }

        if (status === 'completed') {
            // Balance is now added at booking time in this system 
            // to allow admin to manage payouts as soon as student pays admin.
            // So we just update the session status.
        }
        
        await session.save();

        // Notify Candidate
        let notificationType = 'system';
        let title = 'Session Update';
        let message = `Your session status has been updated to ${status}.`;

        if (status === 'accepted') {
            notificationType = 'session_accepted';
            title = 'Session Accepted';
            message = `Your session request has been accepted.`;
        } else if (status === 'cancelled') {
            notificationType = 'session_cancelled';
            title = 'Session Cancelled';
            message = `Your session reservation has been cancelled.`;
        }

        await createNotification({
            recipient: session.candidate,
            sender: req.user._id,
            type: notificationType,
            title,
            message,
            link: '/dashboard?view=sessions'
        });

        res.json(session);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    bookSession,
    getMySessions,
    updateSessionStatus,
};
