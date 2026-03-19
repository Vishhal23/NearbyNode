const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer',
    },
    avatar: { type: String, default: '' },
    firebaseUid: { type: String, default: '' },

    // Seller-specific fields
    businessName: { type: String, default: '' },
    businessType: {
        type: String,
        enum: ['', 'food', 'crafts', 'clothing', 'electronics', 'services', 'other'],
        default: '',
    },
    businessAddress: { type: String, default: '' },
    businessDescription: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'rejected'],
        default: 'none',
    },
    kyc: {
        aadhaarVerified: { type: Boolean, default: false },
        aadhaarNumber: { type: String, default: '' },
        googleVerified: { type: Boolean, default: false },
        mobileVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
    },

    // Trust & Credibility
    credibilityScore: { type: Number, default: 0, min: 0, max: 5 },
    totalTransactions: { type: Number, default: 0 },
    successfulTransactions: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    badge: {
        type: String,
        enum: ['new', 'verified', 'trusted', 'elite'],
        default: 'new',
    },

    // Aadhaar Document Verification
    aadhaarSubmitted: { type: Boolean, default: false },
    aadhaarFront: { type: String, default: '' },
    aadhaarBack: { type: String, default: '' },
    aadhaarStatus: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted',
    },
    aadhaarRejectionReason: { type: String, default: '' },

    // Fraud & Moderation
    fraudFlag: { type: Boolean, default: false },
    fraudFlagDate: { type: Date },
    fraudFlagReason: { type: String, default: '' },
    isBanned: { type: Boolean, default: false },
    bannedReason: { type: String, default: '' },
    flagCount: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspendedReason: { type: String, default: '' },
}, {
    timestamps: true,
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ credibilityScore: -1 });
userSchema.index({ location: '2dsphere' });

// Pre-save: Hash password
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method: Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Calculate credibility score
userSchema.methods.calculateCredibility = function () {
    const avgRating = this.averageRating || 0;
    const txnRatio = this.totalTransactions > 0
        ? this.successfulTransactions / this.totalTransactions
        : 0;
    const kycScore = (this.kyc.aadhaarVerified ? 1 : 0) +
        (this.kyc.googleVerified ? 0.5 : 0) +
        (this.kyc.mobileVerified ? 0.5 : 0);
    const accountAge = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24 * 30);
    const ageScore = Math.min(accountAge / 12, 1);

    this.credibilityScore = (avgRating * 0.4) +
        (txnRatio * 5 * 0.3) +
        (kycScore * 2.5 * 0.2) +
        (ageScore * 5 * 0.1);

    // Update badge
    if (this.credibilityScore >= 4.6) this.badge = 'elite';
    else if (this.credibilityScore >= 3.6) this.badge = 'trusted';
    else if (this.credibilityScore >= 2.1 && this.isVerified) this.badge = 'verified';
    else this.badge = 'new';

    return this.credibilityScore;
};

module.exports = mongoose.model('User', userSchema);
