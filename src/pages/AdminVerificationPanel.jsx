import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { adminDocs } from '../assets/mockData';

const statusMap = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
};

const AdminVerificationPanel = () => {
    const [docs, setDocs] = useState(adminDocs);
    const [filterStatus, setFilterStatus] = useState('All');
    const [viewDoc, setViewDoc] = useState(null);

    const handleAction = (id, action) => {
        setDocs((prev) =>
            prev.map((doc) =>
                doc.id === id ? { ...doc, status: action === 'approve' ? 'Approved' : 'Rejected' } : doc
            )
        );
    };

    const filtered = filterStatus === 'All' ? docs : docs.filter((d) => d.status === filterStatus);

    const countByStatus = (s) => docs.filter((d) => d.status === s).length;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">🛡️</span>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Verification Panel</h1>
                </div>
                <p className="text-gray-400 text-sm">Review seller identity documents and approve or reject submissions.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Submissions', value: docs.length, color: 'from-blue-500 to-blue-600', icon: '📋' },
                    { label: 'Pending', value: countByStatus('Pending'), color: 'from-amber-400 to-amber-500', icon: '⏳' },
                    { label: 'Under Review', value: countByStatus('Under Review'), color: 'from-indigo-500 to-indigo-600', icon: '🔍' },
                    { label: 'Approved', value: countByStatus('Approved'), color: 'from-green-500 to-green-600', icon: '✅' },
                ].map((s) => (
                    <div key={s.label} className="card p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg flex-shrink-0 shadow-sm`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${filterStatus === status
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        {status}
                        {status !== 'All' && (
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filterStatus === status ? 'bg-white/20' : 'bg-gray-100'}`}>
                                {docs.filter((d) => d.status === status).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5 text-left">#</th>
                                <th className="px-6 py-3.5 text-left">Seller Name</th>
                                <th className="px-6 py-3.5 text-left">Document Type</th>
                                <th className="px-6 py-3.5 text-left">Location</th>
                                <th className="px-6 py-3.5 text-left">Submitted</th>
                                <th className="px-6 py-3.5 text-left">Status</th>
                                <th className="px-6 py-3.5 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((doc, idx) => {
                                const isActionable = doc.status === 'Pending' || doc.status === 'Under Review';
                                return (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 text-sm text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {doc.sellerName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{doc.sellerName}</p>
                                                    <p className="text-xs text-gray-400">{doc.productCount} products</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                                                <span>🪪</span> {doc.docType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            📍 {doc.location}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{doc.submittedDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMap[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setViewDoc(doc)}
                                                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                                >
                                                    👁 View
                                                </button>
                                                {isActionable && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(doc.id, 'approve')}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(doc.id, 'reject')}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <span className="text-4xl">📭</span>
                            <p className="mt-3 text-sm">No documents with status "{filterStatus}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Document Modal */}
            {viewDoc && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewDoc(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-lg text-gray-900">Document Preview</h3>
                            <button onClick={() => setViewDoc(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <div className="bg-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center mb-5 border-2 border-dashed border-gray-200">
                            <span className="text-5xl mb-3">🪪</span>
                            <p className="font-semibold text-gray-700">{viewDoc.docType}</p>
                            <p className="text-xs text-gray-400 mt-1">Document from {viewDoc.sellerName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Submitted: {viewDoc.submittedDate}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-gray-400 text-xs">Seller</p>
                                <p className="font-semibold text-gray-900">{viewDoc.sellerName}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-gray-400 text-xs">Location</p>
                                <p className="font-semibold text-gray-900">{viewDoc.location}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => { handleAction(viewDoc.id, 'approve'); setViewDoc(null); }}
                                className="btn-success flex-1"
                            >
                                ✓ Approve
                            </button>
                            <button
                                onClick={() => { handleAction(viewDoc.id, 'reject'); setViewDoc(null); }}
                                className="btn-danger flex-1"
                            >
                                ✕ Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminVerificationPanel;
