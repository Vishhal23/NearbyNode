import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

const AdminKYCPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | pending | approved | rejected

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const res = await adminService.getKycSubmissions();
            setSubmissions(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            await adminService.approveKyc(id);
            setSubmissions(prev => prev.map(u => u._id === id ? { ...u, aadhaarStatus: 'approved' } : u));
        } catch (err) { console.error(err); }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminService.rejectKyc(id, reason);
            setSubmissions(prev => prev.map(u => u._id === id ? { ...u, aadhaarStatus: 'rejected', aadhaarRejectionReason: reason } : u));
        } catch (err) { console.error(err); }
    };

    const filtered = filter === 'all' ? submissions : submissions.filter(s => s.aadhaarStatus === filter);

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            not_submitted: 'bg-gray-100 text-gray-500',
        };
        return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || 'bg-gray-100 text-gray-500'}`;
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">KYC / Aadhaar Verification</h1>
                <p className="text-gray-400 text-sm mt-1">Review and manage Aadhaar document submissions</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${filter === f
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {f} ({f === 'all' ? submissions.length : submissions.filter(s => s.aadhaarStatus === f).length})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                </div>
            ) : filtered.length > 0 ? (
                <div className="space-y-4">
                    {filtered.map((user) => (
                        <div key={user._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <div className="flex flex-col lg:flex-row gap-5">
                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                            ) : (
                                                user.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                        <span className={statusBadge(user.aadhaarStatus)}>{user.aadhaarStatus?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p><strong>Aadhaar Number:</strong> {user.kyc?.aadhaarNumber || 'N/A'}</p>
                                        <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
                                        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                                        {user.aadhaarRejectionReason && (
                                            <p className="text-red-500"><strong>Rejection Reason:</strong> {user.aadhaarRejectionReason}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Document Images */}
                                <div className="flex gap-3">
                                    {user.aadhaarFront && (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 mb-1 font-medium">Front</p>
                                            <a href={user.aadhaarFront} target="_blank" rel="noopener noreferrer">
                                                <img src={user.aadhaarFront} alt="Aadhaar Front" className="w-40 h-28 object-cover rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" />
                                            </a>
                                        </div>
                                    )}
                                    {user.aadhaarBack && (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400 mb-1 font-medium">Back</p>
                                            <a href={user.aadhaarBack} target="_blank" rel="noopener noreferrer">
                                                <img src={user.aadhaarBack} alt="Aadhaar Back" className="w-40 h-28 object-cover rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            {user.aadhaarStatus === 'pending' && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button onClick={() => handleApprove(user._id)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                        ✅ Approve KYC
                                    </button>
                                    <button onClick={() => handleReject(user._id)} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                        ❌ Reject KYC
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                    <span className="text-5xl block mb-3">🪪</span>
                    <p className="text-gray-500 text-lg font-semibold">No KYC submissions {filter !== 'all' ? `with status "${filter}"` : ''}</p>
                    <p className="text-gray-400 text-sm mt-1">Check back later for new submissions.</p>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminKYCPage;
