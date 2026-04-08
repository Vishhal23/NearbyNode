const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Category-based default images (server-side fallback)
const CATEGORY_IMAGES = {
    'Food & Spices': 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&h=400&fit=crop',
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=400&fit=crop',
    'Clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=400&fit=crop',
    'Home & Garden': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop',
    'Jewellery': 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=400&fit=crop',
    'Handicrafts': 'https://images.unsplash.com/photo-1509660933844-6910e12765a0?w=600&h=400&fit=crop',
    'Beauty & Wellness': 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&h=400&fit=crop',
    'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    'Raw Materials': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
    'Dairy & Eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=400&fit=crop',
    'Grains & Pulses': 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&h=400&fit=crop',
};

/** Returns image URL for a category, or a generic market image */
const getCategoryImage = (category) => {
    if (!category) return 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=400&fit=crop';
    if (CATEGORY_IMAGES[category]) return CATEGORY_IMAGES[category];
    const key = Object.keys(CATEGORY_IMAGES).find(
        (k) => k.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(k.toLowerCase())
    );
    return key ? CATEGORY_IMAGES[key] : 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=400&fit=crop';
};

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
    body('price').isNumeric().withMessage('Price must be a number').custom((v) => v > 0).withMessage('Price must be greater than 0'),
    body('category').notEmpty().withMessage('Category is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        // Whitelist allowed fields — prevent mass assignment attacks
        const { title, description, price, category, imageUrl, images, stock, tags } = req.body;

        // Auto-assign category default image if seller didn't provide one
        const finalImageUrl = imageUrl && imageUrl.trim() !== ''
            ? imageUrl.trim()
            : getCategoryImage(category);

        const product = await Product.create({
            title, description, price, category,
            imageUrl: finalImageUrl,
            images, stock, tags,
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
