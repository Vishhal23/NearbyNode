const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    body('shippingAddress.addressLine1').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calculate totals
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: `Product '${item.title || item.product}' is not available`,
                });
            }

            // Check stock availability
            const requestedQty = item.quantity || 1;
            if (product.stock < requestedQty) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for '${product.title}'. Only ${product.stock} available.`,
                });
            }

            const orderItem = {
                product: product._id,
                seller: product.seller,
                title: product.title,
                price: product.price,
                quantity: requestedQty,
                imageUrl: product.imageUrl,
            };

            totalAmount += orderItem.price * orderItem.quantity;
            orderItems.push(orderItem);
        }

        // Decrement stock for all items
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        const deliveryCharge = totalAmount < 500 ? 40 : 0;
        const grandTotal = totalAmount + deliveryCharge;

        // If 'stripe', create in unpaid state. Else, mock payment.
        const isStripe = paymentMethod === 'stripe';
        const initialPaymentStatus = isStripe ? 'unpaid' : 'paid';
        const initialStatus = isStripe ? 'pending' : 'confirmed';

        const order = await Order.create({
            buyer: req.user._id,
            items: orderItems,
            totalAmount,
            deliveryCharge,
            grandTotal,
            shippingAddress,
            paymentMethod: paymentMethod || 'mock',
            paymentStatus: initialPaymentStatus,
            status: initialStatus,
            statusHistory: [
                { status: 'pending', note: 'Order placed' },
                ...(!isStripe ? [{ status: 'confirmed', note: 'Payment confirmed (mock)' }] : [])
            ],
        });

        // If mock payment, immediately update product & seller stats
        if (!isStripe) {
            for (const item of orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { totalSold: item.quantity },
                });
            }

            const sellerIds = [...new Set(orderItems.map((i) => i.seller.toString()))];
            for (const sellerId of sellerIds) {
                await User.findByIdAndUpdate(sellerId, {
                    $inc: { totalTransactions: 1, successfulTransactions: 1 },
                });
            }

            return res.status(201).json({ success: true, data: order });
        }

        // If Stripe, create checkout session
        const origin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

        // Build line items for Stripe
        const lineItems = orderItems.map(item => {
            // Stripe requires absolute URLs for product images
            const isValidUrl = item.imageUrl && (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://'));
            const finalImageUrl = isValidUrl ? item.imageUrl : (item.imageUrl ? `${origin}${item.imageUrl}` : '');

            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.title,
                        images: finalImageUrl ? [finalImageUrl] : []
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe expects exact paise, prevent decimal floats
                },
                quantity: item.quantity,
            };
        });

        // Add delivery charge if applicable
        if (deliveryCharge > 0) {
            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Delivery Charge' },
                    unit_amount: Math.round(deliveryCharge * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            // automatic_payment_methods pulls live settings from your Stripe Dashboard (like UPI, Cards, Wallets)
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
            cancel_url: `${origin}/checkout?canceled=true`,
            client_reference_id: order._id.toString(),
            customer_email: req.user.email,
        });

        // Store stripe session id in order (temporarily mapping to a field or just return)
        order.paymentMethodId = session.id;
        await order.save();

        res.status(201).json({ success: true, checkoutUrl: session.url, data: order });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/orders/verify-payment
// @desc    Verify Stripe Checkout Session and mark order paid
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { session_id, order_id } = req.body;
        if (!session_id || !order_id) {
            return res.status(400).json({ success: false, message: 'Session ID and Order ID are required' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const order = await Order.findById(order_id);
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            if (order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Stripe' });
                await order.save();

                // Update product stats
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { totalSold: item.quantity },
                    });
                }
                const sellerIds = [...new Set(order.items.map(i => i.seller.toString()))];
                for (const sellerId of sellerIds) {
                    await User.findByIdAndUpdate(sellerId, {
                        $inc: { totalTransactions: 1, successfulTransactions: 1 },
                    });
                }
            }

            return res.json({ success: true, message: 'Payment verified', data: order });
        } else {
            return res.status(400).json({ success: false, message: 'Payment not successful yet' });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
});

// @route   GET /api/orders/my
// @desc    Get current user's orders
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/orders/seller
// @desc    Get orders for seller's products
// @access  Private (seller)
router.get('/seller', protect, async (req, res) => {
    try {
        const orders = await Order.find({ 'items.seller': req.user._id })
            .populate('buyer', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer', 'name email avatar');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only buyer or seller of items can view
        const isBuyer = order.buyer._id.toString() === req.user._id.toString();
        const isSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
        if (!isBuyer && !isSeller && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (seller/admin)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Authorization: only seller of items or admin can update
        const isSeller = order.items.some(i => i.seller.toString() === req.user._id.toString());
        const isAdmin = req.user.role === 'admin';
        if (!isSeller && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
        }

        // Validate status transition — prevent invalid jumps
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: ['refunded'],
            refunded: [],
        };

        const allowed = validTransitions[order.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change order from '${order.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
            });
        }

        order.status = status;
        order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

        if (status === 'delivered') order.deliveredAt = new Date();
        if (status === 'cancelled') {
            order.cancelledAt = new Date();
            order.cancelReason = note || '';

            // Restore stock on cancellation
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
