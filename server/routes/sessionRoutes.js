const express = require('express');
const router = express.Router();
const { bookSession, getMySessions, updateSessionStatus } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookSession);
router.get('/', protect, getMySessions);
router.put('/:id', protect, updateSessionStatus);

module.exports = router;
