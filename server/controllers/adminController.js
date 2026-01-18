const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

// @desc    Get all users (or filter by role)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error("getUsers Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all mentor applications (profiles with user data)
// @route   GET /api/admin/mentor-applications
// @access  Private/Admin
const getMentorApplications = async (req, res) => {
    try {
        // Fetch all mentor profiles and populate the user data
        const applications = await MentorProfile.find({})
            .populate('user', 'name email isMentorVerified studentIdUrl phone role');
        
        res.json(applications);
    } catch (error) {
        console.error("getMentorApplications Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify a mentor
// @route   PUT /api/admin/verify-mentor/:id
// @access  Private/Admin
const verifyMentor = async (req, res) => {
    try {
        console.log("Verifying mentor with ID:", req.params.id);
        
        // Validate ObjectId
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        // Use findByIdAndUpdate to bypass pre-save hooks (avoids password hashing issues)
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { isMentorVerified: true },
            { new: true }
        );

        if (user) {
            console.log("Mentor verified successfully:", user.email);
            res.json({ message: 'Mentor verified', user });
        } else {
            console.log("User not found for ID:", req.params.id);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("verifyMentor Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Unverify/Reject a mentor
// @route   PUT /api/admin/unverify-mentor/:id
// @access  Private/Admin
const unverifyMentor = async (req, res) => {
    try {
        console.log("Unverifying mentor with ID:", req.params.id);
        
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { isMentorVerified: false },
            { new: true }
        );

        if (user) {
            console.log("Mentor unverified successfully:", user.email);
            res.json({ message: 'Mentor unverified', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("unverifyMentor Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get platform financial stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'completed' });
        
        // Revenue = Everything coming IN (session bookings + subscriptions)
        const incomingPayments = payments.filter(p => p.type === 'session_booking' || p.type === 'subscription');
        const totalRevenue = incomingPayments.reduce((acc, current) => acc + current.amount, 0);
        
        // Commission = What the platform keeps from session bookings
        const totalCommission = incomingPayments.reduce((acc, current) => acc + (current.adminCommission || 0), 0);
        
        // Payouts = What has actually been sent to mentors (type: 'payout')
        const outgoingPayments = payments.filter(p => p.type === 'payout');
        const totalMentorPayout = outgoingPayments.reduce((acc, current) => acc + current.amount, 0);

        // Pending Balance = Sum of all mentor wallet balances
        const mentors = await MentorProfile.find({});
        const totalPendingBalance = mentors.reduce((acc, m) => acc + (m.walletBalance || 0), 0);

        res.json({
            totalRevenue,
            totalCommission,
            totalMentorPayout,
            totalPendingBalance,
            transactionCount: incomingPayments.length,
            payoutCount: outgoingPayments.length
        });
    } catch (error) {
        console.error("getPlatformStats Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const { createNotification } = require('./notificationController');

// @desc    Process payout to mentor
// @route   POST /api/admin/payout/:mentorId
// @access  Private/Admin
const processPayout = async (req, res) => {
    try {
        const { amount, transactionId } = req.body;
        const mentorProfile = await MentorProfile.findOne({ user: req.params.mentorId }).populate('user', 'name');

        if (!mentorProfile) {
            console.error("Payout Failed: Mentor profile not found for user ID", req.params.mentorId);
            return res.status(404).json({ message: 'Mentor profile not found' });
        }

        // Use a small epsilon to handle floating point errors if paying out exact balance
        if (amount > (mentorProfile.walletBalance + 0.01)) {
            console.error(`Payout Failed: Insufficient balance. Requested: ${amount}, Available: ${mentorProfile.walletBalance}`);
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Update balance
        mentorProfile.walletBalance = Math.max(0, mentorProfile.walletBalance - amount);
        await mentorProfile.save();

        // Log as a special payout payment
        try {
            await Payment.create({
                user: req.user._id, // Admin
                mentor: req.params.mentorId,
                amount,
                transactionId: transactionId || `PAY-${Date.now()}`,
                paymentMethod: 'system',
                type: 'payout',
                status: 'completed'
            });
        } catch (dbError) {
            console.error("Payout Logging Error (DB):", dbError);
            // Even if logging fails, we already deducted the balance, 
            // but in a production app we should use transactions.
        }

        // Notify Mentor
        try {
            await createNotification({
                recipient: req.params.mentorId,
                sender: req.user._id, 
                type: 'payout',
                title: 'Payout Received',
                message: `A payout of ৳${amount} has been processed. Transaction Ref: ${transactionId}. Your due balance has been updated.`,
                link: '/dashboard?view=finances'
            });
        } catch (notifError) {
            console.error("Payout Notification Error:", notifError);
        }

        res.json({ message: 'Payout processed successfully', currentBalance: mentorProfile.walletBalance });
    } catch (error) {
        console.error("processPayout Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const { 
            commissionRate, 
            adminPaymentNumber,
            monthlyPrice,
            yearlyPrice,
            monthlyMentorLimit,
            yearlyMentorLimit,
            monthlySessionLimit,
            yearlySessionLimit
        } = req.body;
        
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings({ 
                commissionRate, 
                adminPaymentNumber,
                monthlyPrice,
                yearlyPrice,
                monthlyMentorLimit,
                yearlyMentorLimit,
                monthlySessionLimit,
                yearlySessionLimit
            });
        } else {
            if (commissionRate !== undefined) settings.commissionRate = commissionRate;
            if (adminPaymentNumber !== undefined) settings.adminPaymentNumber = adminPaymentNumber;
            if (monthlyPrice !== undefined) settings.monthlyPrice = monthlyPrice;
            if (yearlyPrice !== undefined) settings.yearlyPrice = yearlyPrice;
            if (monthlyMentorLimit !== undefined) settings.monthlyMentorLimit = monthlyMentorLimit;
            if (yearlyMentorLimit !== undefined) settings.yearlyMentorLimit = yearlyMentorLimit;
            if (monthlySessionLimit !== undefined) settings.monthlySessionLimit = monthlySessionLimit;
            if (yearlySessionLimit !== undefined) settings.yearlySessionLimit = yearlySessionLimit;
        }

        await settings.save();
        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        console.error("updateSettings Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne() || { 
            commissionRate: 20, 
            adminPaymentNumber: "01700000000",
            monthlyPrice: 500,
            yearlyPrice: 5000,
            monthlyMentorLimit: 2,
            yearlyMentorLimit: 5,
            monthlySessionLimit: 10,
            yearlySessionLimit: 100
        };
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Decline/Reject a mentor application (removes profile)
// @route   DELETE /api/admin/decline-mentor/:id
// @access  Private/Admin
const declineMentorApplication = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // 1. Remove the mentor profile
        await MentorProfile.findOneAndDelete({ user: userId });
        
        // 2. Reset the user's role and verification (just in case)
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                isMentorVerified: false,
                role: 'candidate' // Reset to candidate
            },
            { new: true }
        );

        if (user) {
            res.json({ message: 'Application declined and profile removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("declineMentorApplication Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
    try {
        const transactions = await Payment.find({})
            .populate('user', 'name email')
            .populate('mentor', 'name email')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        console.error("getTransactions Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
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
};
