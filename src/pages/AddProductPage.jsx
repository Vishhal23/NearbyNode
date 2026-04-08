import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { categories } from '../assets/mockData';
import { getCategoryImage } from '../assets/categoryImages';
import productService from '../services/productService';

const AddProductPage = () => {
    const [form, setForm] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        imageUrl: '',
        stock: 10,
    });

    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [published, setPublished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // The image shown in the preview panel
    const previewImage = !imagePreviewError && form.imageUrl
        ? form.imageUrl
        : (form.category ? getCategoryImage(form.category) : null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Reset error when typing new URL
        if (name === 'imageUrl') setImagePreviewError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Determine the final image URL:
            // 1. Use the seller's provided URL if given
            // 2. Fall back to category-based default image
            const finalImageUrl = (form.imageUrl && !imagePreviewError)
                ? form.imageUrl
                : getCategoryImage(form.category);

            const productData = {
                title: form.name,
                description: form.description,
                price: Number(form.price),
                category: form.category,
                imageUrl: finalImageUrl,
                stock: Number(form.stock) || 10,
            };

            await productService.create(productData);
            setPublished(true);
        } catch (err) {
            console.error('Failed to publish product:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to publish product. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPublished(false);
        setForm({ name: '', category: '', price: '', description: '', imageUrl: '', stock: 10 });
        setImagePreviewError(false);
        setError('');
    };

    // ── Success screen ──────────────────────────────────────────
    if (published) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg">
                        ✅
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Submitted!</h2>
                    <p className="text-gray-500 mb-2">
                        Your product is under review and will go live once approved by admin.
                    </p>
                    <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2 mb-8">
                        ⏳ Usually approved within 24 hours
                    </p>
                    <div className="flex gap-3">
                        <button onClick={resetForm} className="btn-primary">
                            ➕ Add Another
                        </button>
                        <a href="/seller/listings" className="btn-outline px-6">
                            My Listings
                        </a>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── Main Form ───────────────────────────────────────────────
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                    Fill in the details to list your product on NearbyNode.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left: Form ── */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="card space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                ⚠️ {error}
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

                        {/* Stock */}
                        <div>
                            <label className="label" htmlFor="stock">Available Stock</label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="1"
                                placeholder="10"
                                value={form.stock}
                                onChange={handleChange}
                                className="input-field"
                            />
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

                        {/* Image URL */}
                        <div>
                            <label className="label" htmlFor="imageUrl">
                                Product Image URL
                                <span className="ml-1 text-xs text-gray-400 font-normal">(optional — we'll pick one based on category)</span>
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                placeholder="https://example.com/your-product-image.jpg"
                                value={form.imageUrl}
                                onChange={handleChange}
                                className="input-field"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                💡 Paste any online image URL (from Google Images, your website, etc.)
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {loading ? 'Publishing...' : '🚀 Publish Product'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-outline px-6">
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Right: Preview Panel ── */}
                <div className="space-y-4">
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-3">Image Preview</h3>

                        {previewImage ? (
                            <div className="rounded-xl overflow-hidden border border-gray-100">
                                <img
                                    src={previewImage}
                                    alt="Product preview"
                                    className="w-full h-48 object-cover"
                                    onError={() => {
                                        setImagePreviewError(true);
                                    }}
                                />
                                <div className="p-2 bg-gray-50 text-center">
                                    {form.imageUrl && !imagePreviewError ? (
                                        <span className="text-xs text-green-600 font-medium">✅ Custom image loaded</span>
                                    ) : (
                                        <span className="text-xs text-blue-600 font-medium">
                                            🎨 Auto-image for: {form.category || 'your category'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-50">
                                <span className="text-4xl mb-3">🖼️</span>
                                <p className="text-sm font-medium text-gray-600">No image yet</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Select a category or paste an image URL to preview
                                </p>
                            </div>
                        )}

                        {imagePreviewError && form.imageUrl && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                                ⚠️ Couldn't load that URL. Using category default instead.
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="card bg-blue-50 border border-blue-100">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2">💡 How to get image URL</h4>
                        <ul className="space-y-1.5 text-xs text-blue-700">
                            <li>• Go to Google Images, right-click an image</li>
                            <li>• Select <strong>"Copy image address"</strong></li>
                            <li>• Paste the URL in the field above</li>
                            <li>• Or leave blank — we pick a category image!</li>
                        </ul>
                    </div>

                    <div className="card bg-green-50 border border-green-100">
                        <h4 className="font-semibold text-green-800 text-sm mb-2">✅ Listing Tips</h4>
                        <ul className="space-y-1.5 text-xs text-green-700">
                            <li>• Include specific product details</li>
                            <li>• Set a competitive price</li>
                            <li>• Mention quantity &amp; condition</li>
                            <li>• Your product needs admin approval</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddProductPage;
