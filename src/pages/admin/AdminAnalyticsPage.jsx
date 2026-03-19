import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

const AdminAnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAnalytics();
            setAnalytics(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                </div>
            </AdminLayout>
        );
    }

    if (!analytics) {
        return (
            <AdminLayout>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                    <span className="text-5xl block mb-3">📈</span>
                    <p className="text-gray-500">Failed to load analytics data.</p>
                </div>
            </AdminLayout>
        );
    }

    const { summary, ordersOverTime, revenueOverTime, paymentBreakdown, topSellers, statusDistribution } = analytics;

    const summaryCards = [
        { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-green-500 to-emerald-600' },
        { label: 'Avg Order Value', value: `₹${summary.avgOrderValue || 0}`, icon: '📊', color: 'from-blue-500 to-blue-600' },
        { label: 'COD Rate', value: `${summary.codPercent || 0}%`, icon: '💵', color: 'from-amber-400 to-amber-500' },
        { label: 'Verified Sellers', value: `${summary.verifiedPercent || 0}%`, icon: '✅', color: 'from-purple-500 to-purple-600' },
    ];

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-400 text-sm mt-1">Platform performance and insights</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {summaryCards.map((card) => (
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

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Orders Over Time */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Orders Over Time</h3>
                    {ordersOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={ordersOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-12 text-sm">No order data available.</p>
                    )}
                </div>

                {/* Revenue Over Time */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Revenue Over Time</h3>
                    {revenueOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={revenueOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-12 text-sm">No revenue data available.</p>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Payment Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Payment Methods</h3>
                    {paymentBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {paymentBreakdown.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-12 text-sm">No payment data available.</p>
                    )}
                </div>

                {/* Top Sellers */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Top Sellers by Revenue</h3>
                    {topSellers.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topSellers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-12 text-sm">No seller data available.</p>
                    )}
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Order Status Distribution</h3>
                    {statusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {statusDistribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 py-12 text-sm">No order data available.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalyticsPage;
