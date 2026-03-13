import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

const MyListingsPage = () => {
    const { user, dbUser } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

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
        if (window.confirm('Are you sure you want to remove this listing?')) {
            try {
                await productService.delete(id);
                setListings((prev) =>
                    prev.map((p) => (p._id === id ? { ...p, status: 'removed' } : p))
                );
            } catch (err) {
                console.error('Failed to delete', err);
            }
        }
    };

    const statusColors = {
        active: 'bg-green-100 text-green-700',
        inactive: 'bg-gray-100 text-gray-600',
        sold: 'bg-blue-100 text-blue-700',
        removed: 'bg-red-100 text-red-700',
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                        <p className="text-sm text-gray-400 mt-1">{listings.filter((l) => l.status !== 'removed').length} products listed</p>
                    </div>
                    <a
                        href="/seller/add-product"
                        className="btn-primary text-sm inline-flex"
                    >
                        ➕ Add New Product
                    </a>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'active', 'inactive', 'sold', 'removed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200 ${filter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f} {f === 'all' ? `(${listings.length})` : `(${listings.filter((l) => l.status === f).length})`}
                        </button>
                    ))}
                </div>

                {/* Listings Table */}
                {filtered.length > 0 ? (
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
                                                        src={product.imageUrl || product.image || 'https://via.placeholder.com/150'}
                                                        alt={product.title}
                                                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.title || product.name}</p>
                                                        <p className="text-xs text-gray-400">{product.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-sm text-gray-900">₹{product.price}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{product.stock || 0}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{product.views || 0}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{product.totalSold || 0}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[product.status] || 'bg-gray-100'}`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
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
                                                    {product.status !== 'removed' && (
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                        >
                                                            Delete
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
                ) : (
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
