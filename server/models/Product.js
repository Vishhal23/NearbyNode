const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
    },
    imageUrl: {
        type: String,
        required: [true, 'Product image is required'],
    },
    images: [{
        url: String,
        public_id: String,
    }],
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'sold', 'flagged', 'removed', 'rejected'],
        default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    stock: {
        type: Number,
        default: 1,
        min: 0,
    },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
}, {
    timestamps: true,
});

// Indexes for search and filtering
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
