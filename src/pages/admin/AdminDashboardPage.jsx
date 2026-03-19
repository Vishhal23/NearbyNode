import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes, pendingRes] = await Promise.all([
                adminService.getStats(),
                adminService.getRecentOrders(),
                adminService.getPendingProducts(),
            ]);
            setStats(statsRes.data);
            setRecentOrders(ordersRes.data || []);
            setPendingProducts(pendingRes.data || []);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminService.approveProduct(id);
            setPendingProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminService.rejectProduct(id, reason);
            setPendingProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    const statusBadge = (status) => {
        const map = {
            delivered: 'bg-green-100 text-green-700',
            shipped: 'bg-blue-100 text-blue-700',
            processing: 'bg-amber-100 text-amber-700',
            confirmed: 'bg-indigo-100 text-indigo-700',
            pending: 'bg-yellow-100 text-yellow-700',
            cancelled: 'bg-red-100 text-red-700',
            paid: 'bg-green-100 text-green-700',
            unpaid: 'bg-orange-100 text-orange-700',
            failed: 'bg-red-100 text-red-700',
        };
        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                </div>
            </AdminLayout>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
        { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', color: 'from-green-500 to-green-600' },
        { label: 'Pending Approval', value: stats?.pendingProducts || 0, icon: '⏳', color: 'from-amber-400 to-amber-500' },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'from-purple-500 to-purple-600' },
    ];

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Platform overview and quick actions</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                </div>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">Order ID</th>
                                    <th className="px-6 py-3 text-left">Buyer</th>
                                    <th className="px-6 py-3 text-left">Amount</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">#{order._id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.buyer?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.grandTotal}</td>
                                        <td className="px-6 py-4"><span className={statusBadge(order.status)}>{order.status}</span></td>
                                        <td className="px-6 py-4"><span className={statusBadge(order.paymentStatus)}>{order.paymentStatus}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-400">
                        <span className="text-4xl block mb-3">📋</span>
                        <p className="text-sm">No orders yet.</p>
                    </div>
                )}
            </div>

            {/* Pending Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Pending Products</h2>
                </div>
                {pendingProducts.length > 0 ? (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingProducts.map((product) => (
                            <div key={product._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover bg-gray-100" />
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{product.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">by {product.seller?.name || 'Unknown'}</p>
                                    <p className="text-lg font-bold text-gray-900 mt-2">₹{product.price}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => handleApprove(product._id)} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors">Approve</button>
                                        <button onClick={() => handleReject(product._id)} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">Reject</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-400">
                        <span className="text-4xl block mb-3">✅</span>
                        <p className="text-sm">All products reviewed ✓</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
