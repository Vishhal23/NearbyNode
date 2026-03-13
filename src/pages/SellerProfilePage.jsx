import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import TrustBadge from '../components/TrustBadge';
import { sellers, reviews, products } from '../assets/mockData';
import ProductCard from '../components/ProductCard';
import { useKYC } from '../context/KYCContext';
import { initiateKYCSession, computeTrustScore } from '../services/kycService';
import { useAuth } from '../context/AuthContext';

const StarRating = ({ rating, size = 'normal' }) => (
    <div className={`flex items-center gap-0.5 ${size === 'sm' ? 'text-sm' : 'text-lg'}`}>
        {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
        ))}
    </div>
);

const SellerProfilePage = () => {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    const { kycData, isKYCVerified, kycLoading, resetKYC } = useKYC();
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);

    const handleDisconnectKYC = () => {
        resetKYC();
        setConfirmDisconnect(false);
    };

    const mockSeller = sellers[0]; // fallback for stats/products/reviews

    // ── Build seller data from real user profile ─────────────────────
    const seller = {
        name: user?.displayName || userProfile?.displayName || mockSeller.name,
        avatar: userProfile?.photoURL || user?.photoURL || '',
        location: userProfile?.location || mockSeller.location,
        bio: userProfile?.bio || mockSeller.bio,
        joinedDate: userProfile?.createdAt
            ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            : mockSeller.joinedDate,
        // These can be wired to real data later
        totalProducts: mockSeller.totalProducts,
        totalOrders: mockSeller.totalOrders,
        avgRating: mockSeller.avgRating,
        isMobileVerified: !!user?.phoneNumber,
        isLocationVerified: !!userProfile?.location,
        isDocumentVerified: isKYCVerified,
    };

    const sellerProducts = products.filter((p) => p.sellerId === mockSeller.id);
    const sellerReviews = reviews.filter((r) => r.sellerId === mockSeller.id);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    };

    // ── Dynamic Trust Score ───────────────────────────────────
    const trustScoreData = computeTrustScore({
        avgRating: seller.avgRating,
        kycVerified: isKYCVerified,
        phoneVerified: seller.isMobileVerified,
        locationVerified: seller.isLocationVerified,
        googleVerified: !!user?.providerData?.find(p => p.providerId === 'google.com'),
    });

    // ── Start KYC Session ─────────────────────────────────────
    const [kycStarting, setKycStarting] = React.useState(false);

    const handleStartKYC = async () => {
        setKycStarting(true);
        try {
            const session = await initiateKYCSession(user?.uid || 'demo-user');
            navigate(session.redirectUrl);
        } catch (err) {
            console.error('Failed to start KYC session:', err);
        } finally {
            setKycStarting(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Profile Card */}
                <div className="card mb-6 overflow-hidden p-0">
                    {/* Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-green-600 relative">
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }} />
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar + Name Row */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                            <div className="relative">
                                {seller.avatar ? (
                                    <img
                                        src={seller.avatar}
                                        alt={seller.name}
                                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                        }}
                                    />
                                ) : null}
                                {!seller.avatar && (
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-2xl font-bold">
                                        {getInitials(seller.name)}
                                    </div>
                                )}
                                {seller.isDocumentVerified && (
                                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs">✓</span>
                                )}
                            </div>
                            <div className="flex-1 sm:pb-1">
                                <div className="flex flex-wrap items-start sm:items-center justify-between gap-2">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                                        <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                                            📍 {seller.location} · Member since {seller.joinedDate}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="btn-primary py-2 text-sm"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-5">{seller.bio}</p>

                        {/* ── Dynamic Trust Score ─────────────────────────────── */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🛡️</span>
                                    <span className="font-semibold text-gray-900">Trust Score</span>
                                </div>
                                <span className="text-2xl font-extrabold text-blue-700">{trustScoreData.total}%</span>
                            </div>
                            <div className="trust-score-bar mb-3">
                                <div className="trust-score-fill" style={{ width: `${trustScoreData.total}%` }} />
                            </div>
                            {/* Score Breakdown */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {[
                                    { label: 'Ratings', value: trustScoreData.breakdown.ratings, max: 40, icon: '⭐' },
                                    { label: 'Aadhaar KYC', value: trustScoreData.breakdown.kyc, max: 25, icon: '🪪' },
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

                        {/* ── Aadhaar KYC Badge ───────────────────────────────── */}
                        <div className="mb-5">
                            {isKYCVerified && kycData ? (
                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <span className="text-xl">🪪</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-800 flex items-center gap-1.5">
                                                    Aadhaar Verified
                                                    <span className="text-xs bg-green-200 text-green-800 px-2.5 py-0.5 rounded-full font-medium">
                                                        {kycData.kycProvider}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-green-600 mt-0.5">
                                                    Ref: <code className="font-mono">{kycData.kycReferenceId}</code>
                                                    {' · '}
                                                    {new Date(kycData.verifiedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1.5 text-green-700 text-sm font-semibold">
                                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                                            Verified
                                        </span>
                                    </div>

                                    {/* Disconnect Section */}
                                    <div className="mt-3 pt-3 border-t border-green-100">
                                        {!confirmDisconnect ? (
                                            <button
                                                onClick={() => setConfirmDisconnect(true)}
                                                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                            >
                                                <span>🔓</span> Disconnect Aadhaar KYC
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between flex-wrap gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                                                <p className="text-xs text-red-700 font-medium">
                                                    ⚠️ This will remove your KYC status and −25 Trust Score. Are you sure?
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setConfirmDisconnect(false)}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleDisconnectKYC}
                                                        className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                                                    >
                                                        Yes, Disconnect
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 border border-amber-200 border-dashed rounded-2xl flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <span className="text-xl">🪪</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-amber-800">Aadhaar Not Verified</p>
                                            <p className="text-xs text-amber-600">Verify to gain +25 Trust Score points</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleStartKYC}
                                        disabled={kycStarting || kycLoading}
                                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-60 flex items-center gap-2"
                                    >
                                        {kycStarting ? (
                                            <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting…</>
                                        ) : (
                                            'Verify Now →'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Verification Badges */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">Verification Status</p>
                            <div className="flex flex-wrap gap-2">
                                <TrustBadge type="mobile" verified={seller.isMobileVerified} size="md" />
                                <TrustBadge type="location" verified={seller.isLocationVerified} size="md" />
                                <TrustBadge type="document" verified={seller.isDocumentVerified} size="md" />
                                {/* Aadhaar KYC badge */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${isKYCVerified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                    🪪 {isKYCVerified ? 'Aadhaar Verified' : 'Aadhaar Unverified'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Products', value: seller.totalProducts, icon: '📦' },
                        { label: 'Orders', value: seller.totalOrders, icon: '🛒' },
                        { label: 'Avg Rating', value: `${seller.avgRating} ⭐`, icon: '⭐' },
                    ].map((s) => (
                        <div key={s.label} className="card p-4 text-center">
                            <span className="text-2xl">{s.icon}</span>
                            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Products by this seller */}
                {sellerProducts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Products by {seller.name}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {sellerProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Ratings & Reviews */}
                <div className="card">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">Ratings & Reviews</h2>
                        <div className="flex items-center gap-2">
                            <StarRating rating={seller.avgRating} />
                            <span className="font-bold text-gray-800">{seller.avgRating}</span>
                            <span className="text-gray-400 text-sm">({sellerReviews.length} reviews)</span>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {sellerReviews.map((review) => (
                            <div key={review.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                <img
                                    src={review.buyerAvatar}
                                    alt={review.buyerName}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.buyerName)}&background=3b82f6&color=fff&size=40`;
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                        <span className="font-semibold text-gray-900 text-sm">{review.buyerName}</span>
                                        <span className="text-xs text-gray-400">{review.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <StarRating rating={review.rating} size="sm" />
                                        <span className="text-xs text-gray-500">for: {review.product}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SellerProfilePage;
