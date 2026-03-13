const express = require('express');
const User = require('../models/User');
const Flag = require('../models/Flag');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    List all users
// @access  Admin
router.get('/users', async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            data: users,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/verify/:id
// @desc    Verify or reject a seller
// @access  Admin
router.put('/verify/:id', async (req, res) => {
    try {
        const { action } = req.body; // 'verified' or 'rejected'
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.verificationStatus = action;
        user.isVerified = action === 'verified';
        user.calculateCredibility();
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/flags
// @desc    Get all flags
// @access  Admin
router.get('/flags', async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const flags = await Flag.find(query)
            .populate('reporter', 'name email')
            .populate('seller', 'name email avatar badge credibilityScore flagCount')
            .populate('product', 'title imageUrl')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: flags });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/flags/:id
// @desc    Resolve a flag
// @access  Admin
router.put('/flags/:id', async (req, res) => {
    try {
        const { action, note } = req.body;
        const flag = await Flag.findById(req.params.id);
        if (!flag) {
            return res.status(404).json({ success: false, message: 'Flag not found' });
        }

        flag.status = 'resolved';
        flag.resolution = {
            action,
            note,
            resolvedBy: req.user._id,
            resolvedAt: new Date(),
        };
        await flag.save();

        // Apply action to seller
        if (action === 'score_reduction' || action === 'warning') {
            const seller = await User.findById(flag.seller);
            if (seller) {
                seller.flagCount += 1;
                seller.credibilityScore = Math.max(0, seller.credibilityScore - 0.5);
                if (seller.flagCount >= 3) {
                    seller.isSuspended = true;
                    seller.suspendedAt = new Date();
                    seller.suspendedReason = 'Automated suspension: 3+ verified flags';
                }
                seller.calculateCredibility();
                await seller.save();
            }
        }

        if (action === 'suspension') {
            await User.findByIdAndUpdate(flag.seller, {
                isSuspended: true,
                suspendedAt: new Date(),
                suspendedReason: note || 'Admin suspension',
            });
        }

        res.json({ success: true, data: flag });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/analytics
// @desc    Platform analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
    try {
        const [totalUsers, totalSellers, totalProducts, totalOrders, pendingFlags] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'seller' }),
            Product.countDocuments({ status: 'active' }),
            Order.countDocuments(),
            Flag.countDocuments({ status: 'pending' }),
        ]);

        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalProducts,
                totalOrders,
                pendingFlags,
                totalRevenue: revenueResult[0]?.totalRevenue || 0,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role (promote to admin, seller, or buyer)
// @access  Admin
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['buyer', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be buyer, seller, or admin' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Safety: admin cannot demote themselves
        if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot change your own role' });
        }

        user.role = role;
        if (role === 'admin') {
            user.isVerified = true;
            user.verificationStatus = 'verified';
            user.badge = 'elite';
        }
        await user.save();

        res.json({ success: true, data: user, message: `User role changed to ${role}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
