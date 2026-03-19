const express = require('express');
const User = require('../models/User');
const Flag = require('../models/Report');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalProducts, pendingProducts, totalOrders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Product.countDocuments({ status: 'pending' }),
            Order.countDocuments(),
        ]);
        res.json({ success: true, data: { totalUsers, totalProducts, pendingProducts, totalOrders } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/recent-orders
router.get('/recent-orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/pending-products
router.get('/pending-products', async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' })
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        const query = {};
        if (role && role !== 'all') query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

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

// @route   PATCH /api/admin/users/:id/ban
router.patch('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isBanned = !user.isBanned;
        if (user.isBanned) {
            user.bannedReason = req.body.reason || 'Banned by admin';
        } else {
            user.bannedReason = '';
        }
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/admin/users/:id/flag-fraud
router.patch('/users/:id/flag-fraud', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.fraudFlag = true;
        user.fraudFlagDate = new Date();
        user.fraudFlagReason = req.body.reason || 'Flagged by admin';
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/admin/users/:id/clear-fraud
router.patch('/users/:id/clear-fraud', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.fraudFlag = false;
        user.fraudFlagReason = '';
        user.fraudFlagDate = undefined;
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ═══════════════════════════════════════════════════════════
// PRODUCT APPROVAL
// ═══════════════════════════════════════════════════════════

// @route   PATCH /api/admin/products/:id/approve
router.patch('/products/:id/approve', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        product.status = 'active';
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/admin/products/:id/reject
router.patch('/products/:id/reject', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        product.status = 'rejected';
        product.rejectionReason = req.body.reason || 'Rejected by admin';
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ═══════════════════════════════════════════════════════════
// KYC / AADHAAR VERIFICATION
// ═══════════════════════════════════════════════════════════

// @route   GET /api/admin/kyc
router.get('/kyc', async (req, res) => {
    try {
        const users = await User.find({ aadhaarSubmitted: true })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/admin/kyc/:id/approve
router.patch('/kyc/:id/approve', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.aadhaarStatus = 'approved';
        user.isVerified = true;
        user.verificationStatus = 'verified';
        user.kyc.aadhaarVerified = true;
        user.calculateCredibility();
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/admin/kyc/:id/reject
router.patch('/kyc/:id/reject', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.aadhaarStatus = 'rejected';
        user.aadhaarRejectionReason = req.body.reason || 'Rejected by admin';
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ═══════════════════════════════════════════════════════════
// FRAUD REPORTS
// ═══════════════════════════════════════════════════════════

// @route   GET /api/admin/fraud-reports
router.get('/fraud-reports', async (req, res) => {
    try {
        // 1. Manually flagged users
        const manuallyFlagged = await User.find({ fraudFlag: true }).select('-password');

        // 2. Users with 3+ failed payment orders
        const failedPaymentUsers = await Order.aggregate([
            { $match: { paymentStatus: 'failed' } },
            { $group: { _id: '$buyer', failedCount: { $sum: 1 } } },
            { $match: { failedCount: { $gte: 3 } } },
        ]);
        const failedPaymentUserIds = failedPaymentUsers.map(u => u._id);

        // 3. Users reported 2+ times
        const reportedUsers = await Flag.aggregate([
            { $group: { _id: '$seller', reportCount: { $sum: 1 } } },
            { $match: { reportCount: { $gte: 2 } } },
        ]);
        const reportedUserIds = reportedUsers.map(u => u._id);

        // Combine all unique user IDs
        const allFlaggedIds = new Set([
            ...manuallyFlagged.map(u => u._id.toString()),
            ...failedPaymentUserIds.map(id => id.toString()),
            ...reportedUserIds.map(id => id.toString()),
        ]);

        const users = await User.find({ _id: { $in: [...allFlaggedIds] } }).select('-password');

        // Get order counts and report counts for context
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            const orderCount = await Order.countDocuments({ buyer: user._id });
            const reportCount = await Flag.countDocuments({ seller: user._id });
            const failedOrders = await Order.countDocuments({ buyer: user._id, paymentStatus: 'failed' });

            const reasons = [];
            if (user.fraudFlag) reasons.push('Admin flagged');
            if (failedOrders >= 3) reasons.push(`${failedOrders} failed payments`);
            if (reportCount >= 2) reasons.push(`${reportCount} user reports`);

            return {
                ...user.toObject(),
                orderCount,
                reportCount,
                failedOrders,
                fraudReasons: reasons,
            };
        }));

        res.json({ success: true, data: enrichedUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ═══════════════════════════════════════════════════════════
// FLAGS (existing, kept)
// ═══════════════════════════════════════════════════════════

// @route   GET /api/admin/flags
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
router.put('/flags/:id', async (req, res) => {
    try {
        const { action, note } = req.body;
        const flag = await Flag.findById(req.params.id);
        if (!flag) return res.status(404).json({ success: false, message: 'Flag not found' });

        flag.status = 'resolved';
        flag.resolution = {
            action,
            note,
            resolvedBy: req.user._id,
            resolvedAt: new Date(),
        };
        await flag.save();

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

// ═══════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════

// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Summary stats
        const [totalRevenue, totalOrders, codOrders, verifiedSellers] = await Promise.all([
            Order.aggregate([
                { $match: { paymentStatus: { $in: ['paid', 'unpaid'] }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } },
            ]),
            Order.countDocuments(),
            Order.countDocuments({ paymentMethod: 'cod' }),
            User.countDocuments({ role: 'seller', isVerified: true }),
        ]);
        const totalSellers = await User.countDocuments({ role: 'seller' });

        // Orders over time (last 30 days)
        const ordersOverTime = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Revenue over time (last 30 days)
        const revenueOverTime = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$grandTotal' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Payment method breakdown
        const paymentBreakdown = await Order.aggregate([
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
        ]);

        // Top 5 sellers by revenue
        const topSellers = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.seller', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'seller',
                },
            },
            { $unwind: '$seller' },
            { $project: { name: '$seller.name', revenue: 1 } },
        ]);

        // Order status distribution
        const statusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;
        const codPercent = totalOrders > 0 ? ((codOrders / totalOrders) * 100).toFixed(1) : 0;
        const verifiedPercent = totalSellers > 0 ? ((verifiedSellers / totalSellers) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                summary: {
                    totalRevenue: totalRevenue[0]?.total || 0,
                    avgOrderValue: Math.round(avgOrderValue),
                    codPercent: Number(codPercent),
                    verifiedPercent: Number(verifiedPercent),
                },
                ordersOverTime: ordersOverTime.map(o => ({ date: o._id, count: o.count })),
                revenueOverTime: revenueOverTime.map(r => ({ date: r._id, revenue: r.revenue })),
                paymentBreakdown: paymentBreakdown.map(p => ({ name: p._id || 'unknown', value: p.count })),
                topSellers: topSellers.map(s => ({ name: s.name, revenue: s.revenue })),
                statusDistribution: statusDistribution.map(s => ({ name: s._id, value: s.count })),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ═══════════════════════════════════════════════════════════
// VERIFY SELLER / ROLE (existing, kept)
// ═══════════════════════════════════════════════════════════

// @route   PUT /api/admin/verify/:id
router.put('/verify/:id', async (req, res) => {
    try {
        const { action } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.verificationStatus = action;
        user.isVerified = action === 'verified';
        user.calculateCredibility();
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['buyer', 'seller', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be buyer, seller, or admin' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

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
