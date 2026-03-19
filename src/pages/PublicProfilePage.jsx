import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import TrustBadge from '../components/TrustBadge';
import ProductCard from '../components/ProductCard';
import { computeTrustScore } from '../services/kycService';
import userService from '../services/userService';
import adminService from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const StarRating = ({ rating, size = 'normal' }) => (
    <div className={`flex items-center gap-0.5 ${size === 'sm' ? 'text-sm' : 'text-lg'}`}>
        {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
        ))}
    </div>
);

const PublicProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                const res = await userService.getProfile(id);
                if (res.success) {
                    setSeller(res.data.user);
                    setProducts(res.data.products || []);
                } else {
                    setError('Seller not found');
                }
            } catch (err) {
                console.error('Error fetching seller:', err);
                setError('Failed to load seller profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSellerData();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (error || !seller) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <span className="text-6xl mb-4">👤</span>
                    <h2 className="text-xl font-bold text-gray-800">{error || 'Seller not found'}</h2>
                    <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
                </div>
            </MainLayout>
        );
    }

    // Dynamic Trust Score
    const trustScoreData = computeTrustScore({
        avgRating: seller.averageRating || 0,
        kycVerified: seller.kyc?.aadhaarVerified,
        phoneVerified: !!seller.phone,
        locationVerified: !!seller.location,
        googleVerified: seller.kyc?.googleVerified,
    });

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
                >
                    ← Back
                </button>

                {/* Profile Card */}
                <div className="card mb-6 overflow-hidden p-0">
                    <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-green-600 relative">
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }} />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                            <div className="relative">
                                {seller.avatar ? (
                                    <img
                                        src={seller.avatar}
                                        alt={seller.name}
                                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-2xl font-bold">
                                        {getInitials(seller.name)}
                                    </div>
                                )}
                                {seller.isVerified && (
                                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs">✓</span>
                                )}
                            </div>
                            <div className="flex-1 sm:pb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{seller.businessName || seller.name}</h1>
                                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                                    📍 {seller.location || 'Local Seller'} · Member since {new Date(seller.createdAt).getFullYear()}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-5">{seller.businessDescription || seller.bio || 'No description provided.'}</p>

                        {/* Trust Score */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🛡️</span>
                                    <span className="font-semibold text-gray-900">Credibility Score</span>
                                </div>
                                <span className="text-2xl font-extrabold text-blue-700">{trustScoreData.total}%</span>
                            </div>
                            <div className="trust-score-bar mb-3">
                                <div className="trust-score-fill" style={{ width: `${trustScoreData.total}%` }} />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {[
                                    { label: 'Ratings', value: trustScoreData.breakdown.ratings, max: 40, icon: '⭐' },
                                    { label: 'KYC', value: trustScoreData.breakdown.kyc, max: 25, icon: '🪪' },
                                    { label: 'Phone', value: trustScoreData.breakdown.phone, max: 15, icon: '📱' },
                                    { label: 'Location', value: trustScoreData.breakdown.location, max: 10, icon: '📍' },
                                    { label: 'Google', value: trustScoreData.breakdown.google, max: 10, icon: '🔵' },
                                ].map((item) => (
                                    <div key={item.label} className={`text-center p-2 rounded-xl text-xs ${item.value > 0 ? 'bg-white/80' : 'bg-gray-100/50 opacity-60'}`}>
                                        <div className="text-base mb-0.5">{item.icon}</div>
                                        <div className="font-bold text-gray-900">{item.value}<span className="text-gray-400 font-normal">/{item.max}</span></div>
                                        <div className="text-gray-500">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Badges & Report */}
                        <div className="flex flex-wrap items-center gap-2">
                            <TrustBadge type="mobile" verified={!!seller.phone} size="md" />
                            <TrustBadge type="location" verified={!!seller.location} size="md" />
                            <TrustBadge type="document" verified={seller.kyc?.aadhaarVerified} size="md" />
                            {user && user._id !== id && (
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="ml-auto px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                                >
                                    🚩 Report Seller
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="card p-4 text-center">
                        <span className="text-2xl">📦</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{products.length}</p>
                        <p className="text-xs text-gray-400">Listings</p>
                    </div>
                    <div className="card p-4 text-center">
                        <span className="text-2xl">🛒</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{seller.successfulTransactions || 0}</p>
                        <p className="text-xs text-gray-400">Total Sales</p>
                    </div>
                    <div className="card p-4 text-center">
                        <span className="text-2xl">⭐</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{seller.averageRating || 0}</p>
                        <p className="text-xs text-gray-400">Avg Rating</p>
                    </div>
                </div>

                {/* Listings */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Active Listings</h2>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-10 text-center text-gray-400">
                        No active listings from this seller.
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🚩 Report Seller</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 block mb-2">Reason</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="fake_product">Fake Product</option>
                                    <option value="scam">Scam / Fraud</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="counterfeit">Counterfeit Products</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 block mb-2">Description (optional)</label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder="Provide details..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!reportReason || reportSubmitting}
                                    onClick={async () => {
                                        try {
                                            setReportSubmitting(true);
                                            await adminService.submitReport({
                                                reportedUserId: id,
                                                reason: reportReason,
                                                description: reportDescription,
                                            });
                                            setShowReportModal(false);
                                            setReportReason('');
                                            setReportDescription('');
                                            alert('Report submitted successfully.');
                                        } catch (err) {
                                            alert('Failed to submit report.');
                                            console.error(err);
                                        } finally {
                                            setReportSubmitting(false);
                                        }
                                    }}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default PublicProfilePage;
