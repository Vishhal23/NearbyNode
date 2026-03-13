import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import OrderCard from '../components/OrderCard';
import orderService from '../services/orderService';

const OrderHistoryPage = () => {
    const [filter, setFilter] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data } = await orderService.getMyOrders();
                setOrders(data || []);
            } catch (err) {
                console.error('Failed to load orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    const stats = {
        total: orders.length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
        active: orders.filter((o) => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length,
        totalSpent: orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-sm text-gray-400 mb-6">Track and manage your purchases</p>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-card text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-400">Total Orders</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-card text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                        <p className="text-xs text-gray-400">Delivered</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-card text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                        <p className="text-xs text-gray-400">In Progress</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-card text-center">
                        <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400">Total Spent</p>
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

                {/* Order List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-6xl mb-4">📋</span>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
                        <p className="text-gray-400 text-sm">
                            {filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default OrderHistoryPage;
