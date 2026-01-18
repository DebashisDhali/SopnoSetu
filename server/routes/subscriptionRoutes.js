const express = require('express');
const router = express.Router();
const { purchaseSubscription, selectMentors } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/purchase', protect, purchaseSubscription);
router.post('/select-mentors', protect, selectMentors);

module.exports = router;
