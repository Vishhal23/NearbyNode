/**
 * server/index.js — NearbyNode API Server
 *
 * Full backend: MongoDB, JWT auth, product CRUD, orders, reviews, admin, KYC proxy
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { initializeFirebaseAdmin } = require('./config/firebaseAdmin');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Initialize Firebase Admin SDK ─────────────────────────────
initializeFirebaseAdmin();
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// ── Connect to MongoDB ────────────────────────────────────────
if (process.env.MONGODB_URI) {
    connectDB();
} else {
    console.warn('⚠️  MONGODB_URI not set — DB features disabled. Set it in server/.env');
}

// ── Global Middleware ─────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Serve local image uploads directly (used since Cloudinary API is throwing errors)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ── KYC Proxy Routes (kept from original) ─────────────────────
const API_KEY = process.env.SANDBOX_API_KEY;
const BASE_URL = process.env.SANDBOX_BASE_URL || 'https://api.sandbox.co.in';

const sandboxHeaders = () => ({
    'x-api-key': API_KEY,
    'x-api-version': '1.0',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
});

const simulateOtpSend = () => {
    const ref = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    console.log('[KYC] 🔄 Simulation fallback — OTP send');
    return { success: true, reference_id: ref, message: 'OTP sent to Aadhaar-linked mobile (simulated).', simulated: true };
};

const simulateOtpVerify = (reference_id) => {
    console.log('[KYC] 🔄 Simulation fallback — OTP verify');
    return {
        success: true,
        kycStatus: 'Verified',
        kycProvider: 'Sandbox.co.in',
        kycReferenceId: `SB-${reference_id.toString().slice(-6)}`,
        verifiedAt: new Date().toISOString(),
        message: 'Aadhaar verified successfully (simulated).',
        simulated: true,
    };
};

app.post('/api/kyc/generate-otp', async (req, res) => {
    const { aadhaar_number } = req.body;
    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number))
        return res.status(400).json({ error: 'Invalid Aadhaar number. Must be exactly 12 digits.' });

    if (!API_KEY || API_KEY === 'your_sandbox_api_key_here') {
        return res.json(simulateOtpSend());
    }

    try {
        const response = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp`, {
            method: 'POST',
            headers: sandboxHeaders(),
            body: JSON.stringify({ '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request', aadhaar_number }),
        });
        const data = await response.json();
        if (response.status === 401 || response.status === 403) return res.json(simulateOtpSend());
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'Failed to generate OTP' });
        return res.json({ success: true, reference_id: data.data?.reference_id, message: data.message, simulated: false });
    } catch (err) {
        return res.json(simulateOtpSend());
    }
});

app.post('/api/kyc/verify-otp', async (req, res) => {
    const { reference_id, otp } = req.body;
    if (!reference_id || !otp || !/^\d{6}$/.test(otp))
        return res.status(400).json({ error: 'reference_id and a 6-digit OTP are required.' });

    if (!API_KEY || API_KEY === 'your_sandbox_api_key_here') {
        return res.json(simulateOtpVerify(reference_id));
    }

    try {
        const response = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp/verify`, {
            method: 'POST',
            headers: sandboxHeaders(),
            body: JSON.stringify({ '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request', reference_id, otp }),
        });
        const data = await response.json();
        if (response.status === 401 || response.status === 403) return res.json(simulateOtpVerify(reference_id));
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'OTP verification failed' });
        return res.json({
            success: true, kycStatus: 'Verified', kycProvider: 'Sandbox.co.in',
            kycReferenceId: `SB-${reference_id.toString().slice(-6)}`, verifiedAt: new Date().toISOString(), simulated: false,
        });
    } catch (err) {
        return res.json(simulateOtpVerify(reference_id));
    }
});

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅  NearbyNode API running on http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Origin: ${process.env.ALLOWED_ORIGIN || 'http://localhost:5173'}\n`);
    // Restart triggered to load new .env variables
});
