const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/reviews/seller/:id
// @desc    Get all reviews for a seller
// @access  Public
router.get('/seller/:id', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const total = await Review.countDocuments({ seller: req.params.id });
        const reviews = await Review.find({ seller: req.params.id })
            .populate('buyer', 'name avatar')
            .populate('product', 'title imageUrl')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            data: reviews,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/reviews/product/:id
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id })
            .populate('buyer', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('seller').notEmpty().withMessage('Seller ID is required'),
    body('product').notEmpty().withMessage('Product ID is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        const { rating, comment, seller, product, order } = req.body;

        // Check for duplicate review
        const existing = await Review.findOne({ buyer: req.user._id, product });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        // Check if verified purchase
        let isVerifiedPurchase = false;
        if (order) {
            const orderDoc = await Order.findOne({
                _id: order,
                buyer: req.user._id,
                'items.product': product,
                status: 'delivered',
            });
            isVerifiedPurchase = !!orderDoc;
        }

        const review = await Review.create({
            rating,
            comment: comment || '',
            buyer: req.user._id,
            seller,
            product,
            order,
            isVerifiedPurchase,
            moderationStatus: 'approved',
        });

        await review.populate('buyer', 'name avatar');

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
