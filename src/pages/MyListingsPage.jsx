import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { getCategoryImage } from '../assets/categoryImages';
import { categories } from '../assets/mockData';

// ────────────────────────────────────────────────────────────
//  Edit Product Modal
// ────────────────────────────────────────────────────────────
const EditModal = ({ product, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: product.title || product.name || '',
        price: product.price || '',
        category: product.category || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock || 0,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [previewError, setPreviewError] = useState(false);

    const preview = !previewError && form.imageUrl
        ? form.imageUrl
        : getCategoryImage(form.category);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (name === 'imageUrl') setPreviewError(false);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return setError('Product name is required.');
        if (!form.price || Number(form.price) <= 0) return setError('Enter a valid price.');
        if (!form.category) return setError('Please select a category.');
        setError('');
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                price: Number(form.price),
                category: form.category,
                description: form.description.trim(),
                imageUrl: form.imageUrl.trim() || getCategoryImage(form.category),
                stock: Number(form.stock),
            };
            await productService.update(product._id, payload);
            onSave({ ...product, ...payload });
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Update your listing details below</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg">✕</button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left – Form */}
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Product Name *</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Fresh Red Apples"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                        </div>

                        {/* Price + Stock row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Price (₹) *</label>
                                <input
                                    name="price"
                                    type="number"
                                    min="1"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Stock Qty</label>
                                <input
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={form.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Category *</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition"
                            >
                                <option value="">Select category…</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe your product…"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Image URL</label>
                            <input
                                name="imageUrl"
                                value={form.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                            <p className="text-xs text-gray-400 mt-1">Leave blank to use a category default image</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                    </div>

                    {/* Right – Preview */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Preview</label>
                        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-48 object-cover"
                                onError={() => setPreviewError(true)}
                            />
                            <div className="p-4">
                                <p className="font-semibold text-gray-900 text-sm truncate">{form.title || 'Product Name'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{form.category || 'Category'}</p>
                                <p className="text-lg font-bold text-blue-600 mt-2">
                                    {form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '₹—'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Stock: {form.stock || 0} units</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {saving ? '💾 Saving…' : '✅ Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ────────────────────────────────────────────────────────────
//  My Listings Page
// ────────────────────────────────────────────────────────────
const MyListingsPage = () => {
    const { user, dbUser } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        const fetchListings = async () => {
            if (!dbUser?._id) return;
            try {
                setLoading(true);
                const res = await productService.getSellerProducts(dbUser._id);
                setListings(res.data || []);
            } catch (err) {
                console.error('Failed to fetch seller listings:', err);
                setError('Failed to fetch your listings.');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [dbUser]);

    const filtered = filter === 'all' ? listings : listings.filter((l) => l.status === filter);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await productService.update(id, { status: newStatus });
            setListings((prev) =>
                prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
            );
        } catch (err) {
            console.error('Failed to change status', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently remove this listing?')) {
            try {
                await productService.delete(id);
                setListings((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'removed' } : p)));
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const handleEditSave = (updatedProduct) => {
        setListings((prev) =>
            prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
        );
        setEditingProduct(null);
    };

    const statusColors = {
        active: 'bg-green-100 text-green-700',
        inactive: 'bg-gray-100 text-gray-600',
        sold: 'bg-blue-100 text-blue-700',
        removed: 'bg-red-100 text-red-700',
        pending: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <DashboardLayout>
            {/* Edit Modal */}
            {editingProduct && (
                <EditModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={handleEditSave}
                />
            )}

            <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {listings.filter((l) => l.status !== 'removed').length} products listed
                        </p>
                    </div>
                    <a href="/seller/add-product" className="btn-primary text-sm inline-flex">
                        ➕ Add New Product
                    </a>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'active', 'inactive', 'pending', 'sold', 'removed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200 ${filter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f} ({f === 'all' ? listings.length : listings.filter((l) => l.status === f).length})
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="text-center py-10 text-red-500 text-sm">{error}</div>
                )}

                {/* Listings Table */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Views</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sold</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => (
                                        <tr
                                            key={product._id}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.imageUrl || product.image || getCategoryImage(product.category)}
                                                        alt={product.title}
                                                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                        onError={(e) => { e.target.src = getCategoryImage(product.category); }}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                                            {product.title || product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{product.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-sm text-gray-900">
                                                ₹{Number(product.price).toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{product.stock || 0}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{product.views || 0}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{product.totalSold || 0}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[product.status] || 'bg-gray-100'}`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    {/* Edit button – always available unless removed */}
                                                    {product.status !== 'removed' && (
                                                        <button
                                                            onClick={() => setEditingProduct(product)}
                                                            className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                    )}

                                                    {/* Pause / Activate toggle */}
                                                    {product.status === 'active' && (
                                                        <button
                                                            onClick={() => handleStatusChange(product._id, 'inactive')}
                                                            className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                        >
                                                            Pause
                                                        </button>
                                                    )}
                                                    {product.status === 'inactive' && (
                                                        <button
                                                            onClick={() => handleStatusChange(product._id, 'active')}
                                                            className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}

                                                    {/* Remove */}
                                                    {product.status !== 'removed' && (
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                        >
                                                            🗑 Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-6xl mb-4">📦</span>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-400 text-sm">
                            {filter === 'all' ? 'Start by adding your first product!' : `No ${filter} listings.`}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyListingsPage;
