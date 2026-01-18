const User = require('../models/User');
const Settings = require('../models/Settings');
const Payment = require('../models/Payment');
const { createNotification } = require('./notificationController');

// @desc    Purchase or Renew subscription
// @route   POST /api/subscriptions/purchase
// @access  Private
const purchaseSubscription = async (req, res) => {
    const { plan, transactionId, paymentMethod } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ message: 'Invalid plan' });
    }

    try {
        const settings = await Settings.findOne();
        const price = plan === 'monthly' ? settings.monthlyPrice : settings.yearlyPrice;

        const expiresAt = new Date();
        if (plan === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        const user = await User.findById(req.user._id);
        user.subscriptionPlan = plan;
        user.subscriptionExpires = expiresAt;
        user.sessionsUsed = 0; // Reset usage on renewal/purchase
        user.subscribedMentors = []; // Reset selected mentors on new plan (or keep?)
        // In this requirement, let's reset so they have to pick again for the new month
        
        await user.save();

        // Create Payment Record
        await Payment.create({
            user: req.user._id,
            amount: price,
            transactionId,
            paymentMethod,
            type: 'subscription',
            status: 'completed', // Admin would verify in reality
            reference: user._id // Link to user
        });

        res.json({ message: `Successfully subscribed to ${plan} plan`, user });
    } catch (error) {
        console.error("Subscription Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Select mentors for subscription
// @route   POST /api/subscriptions/select-mentors
// @access  Private
const selectMentors = async (req, res) => {
    const { mentorIds } = req.body; // Array of IDs

    try {
        const settings = await Settings.findOne();
        const limit = req.user.subscriptionPlan === 'monthly' ? settings.monthlyMentorLimit : settings.yearlyMentorLimit;

        if (mentorIds.length > limit) {
            return res.status(400).json({ message: `Your plan only allows selecting ${limit} mentors.` });
        }

        const user = await User.findById(req.user._id);
        
        // Deduplicate mentorIds to prevent "same key" errors in frontend
        const uniqueMentorIds = [...new Set(mentorIds)];

        // Find newly added mentors to notify them
        const previousMentors = user.subscribedMentors.map(id => id.toString());
        const newlyAdded = uniqueMentorIds.filter(id => !previousMentors.includes(id));

        user.subscribedMentors = uniqueMentorIds;
        await user.save();

        if (newlyAdded.length > 0) {
            for (const mId of newlyAdded) {
                try {
                    await createNotification({
                        recipient: mId,
                        sender: req.user._id,
                        type: 'system',
                        title: 'Primary Mentor Selected',
                        message: `${user.name} has selected you as their primary mentor! Sessions will be auto-accepted for this student.`,
                        link: '/dashboard?view=sessions'
                    });
                } catch (err) {
                    console.error("Selection Notif Error:", err);
                }
            }
        }

        res.json({ message: 'Mentors selected successfully', subscribedMentors: user.subscribedMentors });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    purchaseSubscription,
    selectMentors
};
