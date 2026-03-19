const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password, role: role || 'buyer' });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                badge: user.badge,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/auth/firebase
// @desc    Sync Firebase User to MongoDB and return JWT
// @access  Public
// SECURITY: Verifies Firebase ID token server-side when Admin SDK is available
router.post('/firebase', async (req, res) => {
    try {
        const { idToken, firebaseUid: clientUid, email: clientEmail, name, photoURL, phone, role } = req.body;
        console.log(`[AUTH] Received firebase auth request: Email=${clientEmail}, Role=${role}`);

        let firebaseUid, email;

        // ── Verify Firebase ID token server-side (SECURE) ──────────
        const { verifyIdToken, isFirebaseInitialized } = require('../config/firebaseAdmin');

        if (isFirebaseInitialized()) {
            // Production path: Verify the ID token
            if (!idToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Firebase ID token is required for authentication',
                });
            }

            const decoded = await verifyIdToken(idToken);
            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired Firebase token',
                });
            }

            // Use server-verified values (trusted)
            firebaseUid = decoded.uid;
            email = decoded.email || clientEmail;
        } else {
            // Development fallback: trust client-sent UID
            // ⚠️ This is INSECURE — only for local development
            if (!clientUid) {
                return res.status(400).json({ success: false, message: 'Firebase UID is required' });
            }
            firebaseUid = clientUid;
            email = clientEmail;
            console.warn('[Auth] ⚠️  Using INSECURE client-trusted UID (no Firebase Admin SDK)');
        }

        // Try to find user by firebaseUid or email
        let user = await User.findOne({
            $or: [
                { firebaseUid },
                ...(email ? [{ email }] : [])
            ]
        });

        if (!user) {
            // Auto register the user from Firebase
            user = await User.create({
                name: name || 'Anonymous User',
                email: email || `${firebaseUid}@firebase.local`, // Fallback for phone auth
                password: firebaseUid + process.env.JWT_SECRET, // Dummy strict password
                role: (role && ['buyer', 'seller', 'admin'].includes(role)) ? role : 'buyer',
                firebaseUid,
                avatar: photoURL || '',
                phone: phone || ''
            });
        } else {
            // User exists, but let's check if we need to link UID or update role
            let needsSave = false;

            if (!user.firebaseUid) {
                user.firebaseUid = firebaseUid;
                needsSave = true;
            }

            // If the frontend explicitly sent a valid role (e.g. from the Registration page), overwrite it
            if (role && ['buyer', 'seller', 'admin'].includes(role) && user.role !== role) {
                user.role = role;
                needsSave = true;
            }

            // Update phone if provided from login/verification sync
            if (phone && user.phone !== phone) {
                user.phone = phone;
                needsSave = true;
            }

            if (needsSave) {
                await user.save();
            }
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                badge: user.badge,
                credibilityScore: user.credibilityScore,
                isVerified: user.isVerified,
                token,
            },
        });
    } catch (error) {
        console.error('Firebase Auth Sync Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during auth sync' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user (Legacy fallback)
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (user.isSuspended) {
            return res.status(403).json({ success: false, message: 'Account is suspended' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                badge: user.badge,
                credibilityScore: user.credibilityScore,
                isVerified: user.isVerified,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({
        success: true,
        data: user,
    });
});

module.exports = router;
