const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Flag = require('../models/Flag');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user/seller public profile
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // For sellers, get their products too
        let products = [];
        if (user.role === 'seller') {
            products = await Product.find({ seller: user._id, status: 'active' })
                .sort({ createdAt: -1 })
                .limit(20);
        }

        res.json({
            success: true,
            data: { user, products },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const allowedFields = [
            'name', 'avatar', 'phone', 'businessName', 'businessType',
            'businessAddress', 'businessDescription', 'location',
        ];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/users/kyc
// @desc    Submit KYC verification
// @access  Private
router.post('/kyc', protect, async (req, res) => {
    try {
        const { aadhaarVerified, googleVerified, mobileVerified, aadhaarNumber } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (aadhaarVerified !== undefined) user.kyc.aadhaarVerified = aadhaarVerified;
        if (googleVerified !== undefined) user.kyc.googleVerified = googleVerified;
        if (mobileVerified !== undefined) user.kyc.mobileVerified = mobileVerified;
        if (aadhaarNumber) user.kyc.aadhaarNumber = aadhaarNumber;

        // If any KYC done, mark pending / verified
        if (user.kyc.aadhaarVerified || user.kyc.googleVerified || user.kyc.mobileVerified) {
            user.verificationStatus = 'pending';
            user.kyc.verifiedAt = new Date();
        }

        // Auto-verify when Aadhaar is verified
        if (user.kyc.aadhaarVerified) {
            user.isVerified = true;
            user.verificationStatus = 'verified';
        }

        // Recalculate credibility
        user.calculateCredibility();
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/users/:id/credibility
// @desc    Get seller credibility score breakdown
// @access  Public
router.get('/:id/credibility', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.calculateCredibility();
        await user.save();

        res.json({
            success: true,
            data: {
                credibilityScore: user.credibilityScore,
                badge: user.badge,
                averageRating: user.averageRating,
                totalRatings: user.totalRatings,
                totalTransactions: user.totalTransactions,
                successfulTransactions: user.successfulTransactions,
                kyc: user.kyc,
                accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/sellers
// @desc    List all sellers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller', isSuspended: false })
            .select('name avatar badge credibilityScore averageRating totalRatings totalTransactions businessName businessType isVerified createdAt')
            .sort({ credibilityScore: -1 })
            .limit(50);

        res.json({ success: true, data: sellers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/users/report
// @desc    Report a seller
// @access  Private
router.post('/report', protect, async (req, res) => {
    try {
        const { reportedUserId, reason, description } = req.body;
        if (!reportedUserId || !reason) {
            return res.status(400).json({ success: false, message: 'reportedUserId and reason are required' });
        }

        const flag = await Flag.create({
            reporter: req.user._id,
            seller: reportedUserId,
            reason,
            description: description || '',
        });

        // Increment flag count on reported user
        await User.findByIdAndUpdate(reportedUserId, { $inc: { flagCount: 1 } });

        res.status(201).json({ success: true, data: flag });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/users/kyc/submit
// @desc    Submit Aadhaar documents for verification
// @access  Private (seller)
const multer = require('multer');
const path = require('path');

const kycStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'kyc-' + uniqueSuffix + path.extname(file.originalname));
    },
});
const kycUpload = multer({ storage: kycStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/kyc/submit', protect, kycUpload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
]), async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;
        if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
            return res.status(400).json({ success: false, message: 'Valid 12-digit Aadhaar number is required' });
        }

        const host = req.get('host');
        const protocol = req.protocol;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.kyc.aadhaarNumber = aadhaarNumber;
        user.aadhaarSubmitted = true;
        user.aadhaarStatus = 'pending';

        if (req.files?.frontImage?.[0]) {
            user.aadhaarFront = `${protocol}://${host}/uploads/${req.files.frontImage[0].filename}`;
        }
        if (req.files?.backImage?.[0]) {
            user.aadhaarBack = `${protocol}://${host}/uploads/${req.files.backImage[0].filename}`;
        }

        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
