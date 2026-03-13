import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { categories } from '../assets/mockData';
import productService from '../services/productService';

const AddProductPage = () => {
    const [form, setForm] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [published, setPublished] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let uploadedImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';

            // If they uploaded a real image, hit the Cloudinary upload route first
            if (form.image) {
                const uploadRes = await productService.uploadImage(form.image);
                if (uploadRes.success) {
                    uploadedImageUrl = uploadRes.url;
                }
            }

            const productData = {
                title: form.name,
                description: form.description,
                price: Number(form.price),
                category: form.category,
                imageUrl: uploadedImageUrl,
                stock: 10 // default stock
            };

            // Post to backend
            await productService.create(productData);
            setPublished(true);
        } catch (err) {
            console.error('Failed to publish product:', err);
            setError(err.response?.data?.message || err.message || 'Failed to publish product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (published) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg">
                        ✅
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Published!</h2>
                    <p className="text-gray-500 mb-8">Your product is now live and visible to buyers.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setPublished(false); setForm({ name: '', category: '', price: '', description: '', image: null }); setImagePreview(null); }}
                            className="btn-primary"
                        >
                            ➕ Add Another
                        </button>
                        <button onClick={() => setPublished(false)} className="btn-secondary">
                            View Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-400 text-sm mt-0.5">Fill in the details to list your product on NearbyNode.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="card space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}
                        {/* Product Name */}
                        <div>
                            <label className="label" htmlFor="name">Product Name *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="e.g. Organic Turmeric Powder 500g"
                                value={form.name}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Category + Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={form.category}
                                    onChange={handleChange}
                                    className="input-field bg-white"
                                >
                                    <option value="">Select category</option>
                                    {categories.slice(1).map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label" htmlFor="price">Price (₹) *</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="0"
                                        value={form.price}
                                        onChange={handleChange}
                                        className="input-field pl-7"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label" htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                placeholder="Describe your product in detail — quality, sourcing, features..."
                                value={form.description}
                                onChange={handleChange}
                                className="input-field resize-none leading-relaxed"
                            />
                            <div className="flex justify-end mt-1">
                                <span className="text-xs text-gray-400">{form.description.length} / 500</span>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                                {loading ? 'Publishing...' : '🚀 Publish Product'}
                            </button>
                            <button type="button" className="btn-outline px-6">
                                Save Draft
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Image Upload */}
                <div className="space-y-4">
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-3">Product Image</h3>

                        {/* Upload Area */}
                        <label
                            htmlFor="image-upload"
                            className={`block border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${imagePreview ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                    <span className="text-4xl mb-3">📷</span>
                                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
                                </div>
                            )}
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImage}
                            />
                        </label>

                        {imagePreview && (
                            <button
                                type="button"
                                onClick={() => { setImagePreview(null); setForm({ ...form, image: null }); }}
                                className="mt-3 w-full text-sm text-red-500 hover:text-red-700 font-medium border border-red-100 hover:border-red-200 rounded-lg py-1.5 transition-colors"
                            >
                                🗑️ Remove Image
                            </button>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="card bg-blue-50 border border-blue-100">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2">💡 Listing Tips</h4>
                        <ul className="space-y-1.5 text-xs text-blue-700">
                            <li>• Use clear, well-lit photos</li>
                            <li>• Include specific product details</li>
                            <li>• Set a competitive price</li>
                            <li>• Mention quantity & condition</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddProductPage;
