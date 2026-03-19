import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';

const AdminProductApprovalPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingProducts();
    }, []);

    const loadPendingProducts = async () => {
        try {
            setLoading(true);
            const res = await adminService.getPendingProducts();
            setProducts(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            await adminService.approveProduct(id);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminService.rejectProduct(id, reason);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Product Approval</h1>
                <p className="text-gray-400 text-sm mt-1">Review and approve or reject pending products</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative">
                                <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover bg-gray-100" />
                                <span className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    Pending
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 text-base truncate">{product.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">by {product.seller?.name || 'Unknown seller'}</p>
                                <p className="text-xs text-gray-400">{product.seller?.email}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-xl font-bold text-gray-900">₹{product.price}</p>
                                    <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full">{product.condition || 'used'}</span>
                                </div>
                                {product.description && (
                                    <p className="text-xs text-gray-500 mt-3 line-clamp-3">{product.description}</p>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleApprove(product._id)}
                                        className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(product._id)}
                                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                    <span className="text-5xl block mb-3">✅</span>
                    <p className="text-gray-500 text-lg font-semibold">No pending products</p>
                    <p className="text-gray-400 text-sm mt-1">All products have been reviewed.</p>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProductApprovalPage;
