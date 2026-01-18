const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the relative path to the file
    res.json({
        url: `/${req.file.path.replace(/\\/g, '/')}`
    });
});

// @access  Public (For registration)
router.post('/public', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
        url: `/${req.file.path.replace(/\\/g, '/')}`
    });
});

module.exports = router;
