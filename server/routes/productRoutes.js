const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, page = 1, limit = 12, seller } = req.query;
        const query = { status: 'active' };

        if (category) query.category = category;
        if (seller) query.seller = seller;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortObj = { createdAt: -1 };
        if (sort === 'price-asc') sortObj = { price: 1 };
        else if (sort === 'price-desc') sortObj = { price: -1 };
        else if (sort === 'rating') sortObj = { rating: -1 };
        else if (sort === 'popular') sortObj = { totalSold: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('seller', 'name avatar badge credibilityScore isVerified')
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/products/search
// @desc    Search products by text
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        const query = {
            $text: { $search: q },
            status: 'active',
        };

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('seller', 'name avatar badge credibilityScore isVerified')
            .sort({ score: { $meta: 'textScore' } })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            data: products,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name avatar badge credibilityScore isVerified businessName businessType kyc totalTransactions successfulTransactions averageRating totalRatings createdAt');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Increment views
        product.views += 1;
        await product.save();

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (seller only)
router.post('/', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('imageUrl').notEmpty().withMessage('Image URL is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        // Whitelist allowed fields — prevent mass assignment attacks
        const { title, description, price, category, imageUrl, images, stock, tags } = req.body;
        const product = await Product.create({
            title, description, price, category, imageUrl, images, stock, tags,
            seller: req.user._id,
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
        }

        // Whitelist allowed update fields — prevent mass assignment
        const { title, description, price, category, imageUrl, images, stock, tags, status } = req.body;
        const allowedUpdates = {};
        if (title !== undefined) allowedUpdates.title = title;
        if (description !== undefined) allowedUpdates.description = description;
        if (price !== undefined) allowedUpdates.price = price;
        if (category !== undefined) allowedUpdates.category = category;
        if (imageUrl !== undefined) allowedUpdates.imageUrl = imageUrl;
        if (images !== undefined) allowedUpdates.images = images;
        if (stock !== undefined) allowedUpdates.stock = stock;
        if (tags !== undefined) allowedUpdates.tags = tags;
        if (status !== undefined && ['active', 'inactive'].includes(status)) allowedUpdates.status = status;

        product = await Product.findByIdAndUpdate(req.params.id, allowedUpdates, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete)
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
        }

        product.status = 'removed';
        await product.save();

        res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
