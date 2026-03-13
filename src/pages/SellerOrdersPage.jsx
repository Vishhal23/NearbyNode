import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const SellerOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders/seller');
            setOrders(data.data || []);
        } catch (err) {
            console.error('Failed to load seller orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            await api.put(`/orders/${orderId}/status`, {
                status: newStatus,
                note: `Status updated to ${newStatus} by seller`
            });
            // Refresh orders
            await fetchOrders();
        } catch (err) {
            console.error('Failed to update order:', err);
            alert('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const nextStatus = (current) => {
        const flow = {
            pending: 'confirmed',
            confirmed: 'processing',
            processing: 'shipped',
            shipped: 'delivered',
        };
        return flow[current] || null;
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.grandTotal || 0), 0),
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Orders Received</h1>
                <p className="text-gray-400 text-sm mt-0.5">Manage orders from your buyers</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-card text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-400">Total Orders</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-card text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-400">Pending</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-card text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                    <p className="text-xs text-gray-400">Delivered</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-card text-center">
                    <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200 ${filter === f
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filtered.length > 0 ? (
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-card p-5">
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-xs text-gray-400">Order ID</p>
                                    <p className="text-sm font-mono font-semibold text-blue-600">#{order._id.slice(-8)}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {(order.buyer?.name || 'B').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{order.buyer?.name || 'Buyer'}</p>
                                    <p className="text-xs text-gray-400">{order.buyer?.email || ''}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <img
                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80&h=80&fit=crop'}
                                            alt={item.title}
                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80&h=80&fit=crop'; }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Shipping Address */}
                            {order.shippingAddress && (
                                <div className="p-3 bg-blue-50 rounded-xl mb-4">
                                    <p className="text-xs font-semibold text-blue-700 mb-1">📍 Ship To:</p>
                                    <p className="text-xs text-blue-600">
                                        {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                    <p className="text-xs text-blue-600">📞 {order.shippingAddress.phone}</p>
                                </div>
                            )}

                            {/* Footer: Total + Action */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-900">₹{order.grandTotal}</p>
                                    <p className={`text-xs mt-0.5 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ ' + order.paymentStatus}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {nextStatus(order.status) && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, nextStatus(order.status))}
                                            disabled={updatingId === order._id}
                                            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                                        >
                                            {updatingId === order._id ? '...' : `Mark ${nextStatus(order.status)}`}
                                        </button>
                                    )}
                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                            disabled={updatingId === order._id}
                                            className="px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Date */}
                            <p className="text-xs text-gray-400 mt-2">
                                Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-6xl mb-4">📬</span>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                    <p className="text-gray-400 text-sm">When buyers purchase your products, orders will appear here.</p>
                </div>
            )}
        </DashboardLayout>
    );
};

export default SellerOrdersPage;
