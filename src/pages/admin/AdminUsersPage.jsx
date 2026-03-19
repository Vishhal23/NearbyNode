import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        loadUsers();
    }, [page, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getUsers({ search, role: roleFilter, page, limit: 10 });
            setUsers(res.data || []);
            setPagination(res.pagination);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadUsers();
    };

    const handleBan = async (id) => {
        try {
            const res = await adminService.banUser(id);
            setUsers(prev => prev.map(u => u._id === id ? res.data : u));
        } catch (err) { console.error(err); }
    };

    const handleFlagFraud = async (id) => {
        const reason = prompt('Enter fraud reason:');
        if (!reason) return;
        try {
            const res = await adminService.flagFraud(id, reason);
            setUsers(prev => prev.map(u => u._id === id ? res.data : u));
        } catch (err) { console.error(err); }
    };

    const roleBadge = (role) => {
        const map = {
            admin: 'bg-red-100 text-red-700',
            seller: 'bg-blue-100 text-blue-700',
            buyer: 'bg-green-100 text-green-700',
        };
        return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[role] || 'bg-gray-100 text-gray-600'}`;
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-400 text-sm mt-1">Manage platform users</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="buyer">Buyers</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                    </select>
                    <button type="submit" className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm">
                        Search
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
                    </div>
                ) : users.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 text-left">User</th>
                                        <th className="px-6 py-3 text-left">Role</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-left">Flags</th>
                                        <th className="px-6 py-3 text-left">Joined</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                                        ) : (
                                                            user.name?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className={roleBadge(user.role)}>{user.role}</span></td>
                                            <td className="px-6 py-4">
                                                {user.isBanned && <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 mr-1">Banned</span>}
                                                {user.fraudFlag && <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mr-1">Fraud</span>}
                                                {user.isVerified && <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>}
                                                {!user.isBanned && !user.fraudFlag && !user.isVerified && <span className="text-xs text-gray-400">Active</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.flagCount || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <button
                                                        onClick={() => handleBan(user._id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${user.isBanned
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                    >
                                                        {user.isBanned ? 'Unban' : 'Ban'}
                                                    </button>
                                                    {!user.fraudFlag && (
                                                        <button
                                                            onClick={() => handleFlagFraud(user._id)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                                                        >
                                                            Flag
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-400">Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}</p>
                                <div className="flex gap-2">
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                                    <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center text-gray-400">
                        <span className="text-4xl block mb-3">👥</span>
                        <p className="text-sm">No users found.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsersPage;
