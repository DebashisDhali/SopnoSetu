const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Restriction check: Only students and mentors can talk, or between them
        // For now, let's just ensure they are either mentor or candidate
        const sender = req.user;
        
        // Prevention: Admin can participate? User said "student only can talk with mentor... mentor with student"
        const isSenderMentor = sender.role === 'mentor';
        const isSenderStudent = sender.role === 'candidate';
        const isReceiverMentor = receiver.role === 'mentor';
        const isReceiverStudent = receiver.role === 'candidate';

        if (!((isSenderMentor && isReceiverStudent) || (isSenderStudent && isReceiverMentor))) {
            return res.status(403).json({ message: 'Chat is only allowed between students and mentors' });
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name role')
            .populate('receiver', 'name role');

        // Notify Receiver
        await createNotification({
            recipient: receiverId,
            sender: req.user._id,
            type: 'new_message',
            title: 'New Message',
            message: `${req.user.name} sent you a message: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
            link: `/dashboard?view=messages&with=${req.user._id}`
        });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("SendMessage Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get messages between current user and another user
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user._id;

        // Find messages where (sender=curr AND receiver=other) OR (sender=other AND receiver=curr)
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name role')
        .populate('receiver', 'name role');

        res.json(messages);
    } catch (error) {
        console.error("GetMessages Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all chat partners for the current user
// @route   GET /api/chat/partners
// @access  Private
const getChatPartners = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Use aggregation to find the last message for each unique conversation
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", currentUserId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$content" },
                    lastTime: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ["$receiver", currentUserId] },
                                    { $eq: ["$isRead", false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partnerInfo'
                }
            },
            {
                $unwind: '$partnerInfo'
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    lastTime: 1,
                    unreadCount: 1,
                    name: '$partnerInfo.name',
                    role: '$partnerInfo.role',
                    email: '$partnerInfo.email'
                }
            },
            {
                $sort: { lastTime: -1 }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error("GetPartners Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark messages from a user as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get total unread message count
// @route   GET /api/chat/unread-count
// @access  Private
const getTotalUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            isRead: false
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getChatPartners,
    markAsRead,
    getTotalUnreadCount
};
