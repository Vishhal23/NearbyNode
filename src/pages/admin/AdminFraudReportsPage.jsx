import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

const AdminFraudReportsPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFraudReports();
    }, []);

    const loadFraudReports = async () => {
        try {
            setLoading(true);
            const res = await adminService.getFraudReports();
            setUsers(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleClearFraud = async (id) => {
        try {
            await adminService.clearFraud(id);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleBan = async (id) => {
        try {
            await adminService.banUser(id);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: true } : u));
        } catch (err) { console.error(err); }
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Fraud Reports</h1>
                <p className="text-gray-400 text-sm mt-1">Users flagged by admins, reports, or suspicious activity</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                </div>
            ) : users.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Role</th>
                                    <th className="px-6 py-3 text-left">Reasons</th>
                                    <th className="px-6 py-3 text-left">Reports</th>
                                    <th className="px-6 py-3 text-left">Failed PMT</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-300 to-red-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm capitalize text-gray-600">{user.role}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.fraudReasons || []).map((reason, i) => (
                                                    <span key={i} className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.reportCount || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.failedOrders || 0}</td>
                                        <td className="px-6 py-4">
                                            {user.isBanned ? (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Banned</span>
                                            ) : user.fraudFlag ? (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Flagged</span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Suspicious</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-1 justify-end">
                                                {!user.isBanned && (
                                                    <button
                                                        onClick={() => handleBan(user._id)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                    >
                                                        Ban
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleClearFraud(user._id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                    <span className="text-5xl block mb-3">🛡️</span>
                    <p className="text-gray-500 text-lg font-semibold">No fraud reports</p>
                    <p className="text-gray-400 text-sm mt-1">The platform is clean. Keep monitoring.</p>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminFraudReportsPage;
