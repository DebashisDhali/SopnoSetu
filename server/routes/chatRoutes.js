const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getChatPartners, markAsRead, getTotalUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/partners', protect, getChatPartners);
router.get('/unread-count', protect, getTotalUnreadCount);
router.put('/read/:userId', protect, markAsRead);
router.get('/:userId', protect, getMessages);

module.exports = router;
