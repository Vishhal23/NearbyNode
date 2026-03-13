import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusBadge = (status) => {
    const map = {
        delivered: 'bg-green-100 text-green-700',
        shipped: 'bg-blue-100 text-blue-700',
        processing: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-indigo-100 text-indigo-700',
        pending: 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`;
};

const SellerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, trustScore: 85 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                // Fetch seller orders
                const ordersRes = await api.get('orders/seller');
                const orders = ordersRes.data.data || [];

                // Fetch seller products
                const productsRes = await api.get('products');
                const allProducts = productsRes.data.data || [];

                // Calculate stats
                const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.grandTotal || 0), 0);

                setStats({
                    totalProducts: allProducts.length,
                    totalOrders: orders.length,
                    revenue,
                    trustScore: 85,
                });
                setRecentOrders(orders.slice(0, 5));
                setProducts(allProducts.slice(0, 5));
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const summaryCards = [
        {
            label: 'My Products',
            value: stats.totalProducts,
            icon: '📦',
            iconBg: 'from-blue-500 to-blue-600',
            link: '/seller/listings',
        },
        {
            label: 'Orders Received',
            value: stats.totalOrders,
            icon: '🛒',
            iconBg: 'from-green-500 to-green-600',
            link: '/seller/orders',
        },
        {
            label: 'Revenue',
            value: `₹${stats.revenue.toLocaleString('en-IN')}`,
            icon: '💰',
            iconBg: 'from-amber-400 to-amber-500',
        },
        {
            label: 'Trust Score',
            value: `${stats.trustScore}%`,
            icon: '🛡️',
            iconBg: 'from-purple-500 to-purple-600',
        },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.displayName || 'Seller'}! Here's your overview.</p>
                </div>
                <Link to="/seller/add-product" className="btn-primary py-2.5 text-sm">
                    ➕ Add Product
                </Link>
            </div>

            {/* Trust Score Banner */}
            <div className="card mb-6 p-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                        <div>
                            <p className="font-semibold">Your Trust Score is Excellent!</p>
                            <p className="text-blue-100 text-sm">Keep it up by maintaining quality and responsiveness.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-extrabold">{stats.trustScore}%</p>
                        <div className="w-32 h-2 bg-white/30 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${stats.trustScore}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {summaryCards.map((card) => (
                    <Link key={card.label} to={card.link || '#'} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
                            {card.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Link to="/seller/add-product" className="bg-white rounded-xl p-4 shadow-card text-center hover:shadow-md transition-shadow group">
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📝</span>
                    <p className="text-xs font-semibold text-gray-700">Add Product</p>
                </Link>
                <Link to="/seller/orders" className="bg-white rounded-xl p-4 shadow-card text-center hover:shadow-md transition-shadow group">
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📬</span>
                    <p className="text-xs font-semibold text-gray-700">View Orders</p>
                </Link>
                <Link to="/seller/listings" className="bg-white rounded-xl p-4 shadow-card text-center hover:shadow-md transition-shadow group">
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📦</span>
                    <p className="text-xs font-semibold text-gray-700">My Listings</p>
                </Link>
                <Link to="/profile/edit" className="bg-white rounded-xl p-4 shadow-card text-center hover:shadow-md transition-shadow group">
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">⚙️</span>
                    <p className="text-xs font-semibold text-gray-700">Settings</p>
                </Link>
            </div>

            {/* Recent Orders Table */}
            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                    <Link to="/seller/orders" className="text-blue-600 text-sm font-medium hover:underline">View All →</Link>
                </div>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">Order ID</th>
                                    <th className="px-6 py-3 text-left">Product</th>
                                    <th className="px-6 py-3 text-left">Buyer</th>
                                    <th className="px-6 py-3 text-left">Amount</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">#{order._id.slice(-6)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{order.items?.[0]?.title || 'Product'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.buyer?.name || 'Buyer'}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.grandTotal}</td>
                                        <td className="px-6 py-4">
                                            <span className={statusBadge(order.status)}>{order.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <span className="text-4xl block mb-3">📬</span>
                        <p className="text-gray-400 text-sm">No orders received yet. Share your products to get started!</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SellerDashboard;
