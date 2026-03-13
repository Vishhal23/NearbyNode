const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
        type: String,
        maxlength: [500, 'Review cannot exceed 500 characters'],
        default: '',
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false,
    },
    isModerated: {
        type: Boolean,
        default: false,
    },
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

// Prevent duplicate reviews per buyer per product
reviewSchema.index({ buyer: 1, product: 1 }, { unique: true });
reviewSchema.index({ seller: 1 });
reviewSchema.index({ rating: -1 });

// Static: Calculate average rating for a seller
reviewSchema.statics.calculateAverageRating = async function (sellerId) {
    const result = await this.aggregate([
        { $match: { seller: sellerId, moderationStatus: { $ne: 'rejected' } } },
        {
            $group: {
                _id: '$seller',
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 },
            },
        },
    ]);

    if (result.length > 0) {
        await mongoose.model('User').findByIdAndUpdate(sellerId, {
            averageRating: Math.round(result[0].averageRating * 10) / 10,
            totalRatings: result[0].totalRatings,
        });
    }
};

// Trigger recalculation after save
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.seller);
});

module.exports = mongoose.model('Review', reviewSchema);
