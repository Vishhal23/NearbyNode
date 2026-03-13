const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary'); // Now simply using local storage fallback

// @route   POST /api/upload
// @desc    Upload an image locally and return URL
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Define standard local backend URL (fallback if env isn't fully set up for prod yet)
        const host = req.get('host');
        const protocol = req.protocol;

        // Final accessible URL of the file (served by Express static directory)
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during local upload' });
    }
});

module.exports = router;
