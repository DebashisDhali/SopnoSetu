const NotificationModel = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized access. Please login.' });
        }
        
        const notifications = await NotificationModel.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
            
        return res.json(notifications || []);
    } catch (error) {
        console.error("GET_NOTIFICATIONS_ERROR:", error);
        return res.status(500).json({ 
            message: 'Internal Server Error while fetching notifications', 
            error: error.message 
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        notification.isRead = true;
        await notification.save();

        return res.json(notification);
    } catch (error) {
        console.error("MARK_READ_ERROR:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await NotificationModel.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        return res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error("MARK_ALL_READ_ERROR:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// Helper function to create notification (for internal use)
const createNotification = async (data) => {
    try {
        return await NotificationModel.create(data);
    } catch (error) {
        console.error("CREATE_NOTIFICATION_ERROR:", error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
};
