const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
    reporter: {
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
    },
    reason: {
        type: String,
        required: [true, 'Reason for flagging is required'],
        enum: [
            'fake_product', 'misleading_info', 'price_gouging',
            'poor_quality', 'no_delivery', 'fraud',
            'harassment', 'inappropriate_content', 'other',
        ],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    evidence: [{
        url: String,
        type: { type: String, enum: ['image', 'screenshot'] },
    }],
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending',
    },
    resolution: {
        action: {
            type: String,
            enum: ['none', 'warning', 'score_reduction', 'suspension', 'ban'],
        },
        note: String,
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resolvedAt: Date,
    },
}, {
    timestamps: true,
});

flagSchema.index({ seller: 1 });
flagSchema.index({ status: 1 });
flagSchema.index({ reporter: 1 });

module.exports = mongoose.model('Flag', flagSchema);
