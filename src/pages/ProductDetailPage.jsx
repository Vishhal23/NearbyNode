import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StarRating from '../components/StarRating';
import CredibilityMeter from '../components/CredibilityMeter';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getById(id);
                const p = res.data || res;
                if (p) {
                    setProduct(p);
                    setSeller(p.seller);
                    // Leave reviews empty for now since we don't have review fetch wired up yet
                    setReviews([]);
                }
            } catch (error) {
                console.error("Error fetching product detail:", error);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            id: product._id || product.id,
            name: product.title || product.name,
            price: product.price,
            image: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : (product.imageUrl || product.image),
            seller: seller?.businessName || seller?.name || 'Unknown',
            sellerId: seller?._id || seller?.id,
        }, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (!product) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <span className="text-6xl block mb-4">🔍</span>
                        <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
                        <Link to="/buyer/home" className="btn-primary mt-4 inline-flex">Browse Products</Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-gray-400">
                        <Link to="/buyer/home" className="hover:text-blue-600 transition-colors">Products</Link>
                        <span>›</span>
                        <span className="text-gray-600">{product.category}</span>
                        <span>›</span>
                        <span className="text-gray-800 font-medium truncate">{product.title || product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-card aspect-square">
                            <img
                                src={(product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : (product.imageUrl || product.image)}
                                alt={product.title || product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=600&fit=crop';
                                }}
                            />
                            {seller?.isVerified && (
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                                        🛡️ Verified Seller
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-3">
                                {product.category}
                            </span>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                                {product.title || product.name}
                            </h1>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <StarRating rating={product.averageRating || product.rating || 0} readonly size="md" />
                            <span className="text-lg font-semibold text-gray-800">{product.averageRating || product.rating || 0}</span>
                            <span className="text-sm text-gray-400">({product.totalRatings || product.reviews || 0} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-5">
                            <p className="text-sm text-gray-500 mb-1">Price</p>
                            <p className="text-4xl font-bold text-gray-900">₹{product.price}</p>
                            <p className="text-xs text-green-600 mt-1">
                                {product.price < 500 ? '+ ₹40 delivery' : '✓ Free delivery'}
                            </p>
                        </div>

                        {/* Quantity */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition-colors flex items-center justify-center"
                                >
                                    −
                                </button>
                                <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition-colors flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md ${added
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                            >
                                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                            </button>
                            <button
                                onClick={() => { handleAddToCart(); navigate('/cart'); }}
                                className="px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Seller Info Card */}
                {seller && (
                    <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h2>
                        <div className="flex items-start gap-5">
                            <img
                                src={seller.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop'}
                                alt={seller.name}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{seller.businessName || seller.name}</h3>
                                    {seller.isVerified && (
                                        <span className="text-green-500 text-sm">✅</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{seller.address || seller.location || 'Local Seller'}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="text-gray-600">⭐ {seller.credibilityScore || 0} trust score</span>
                                    <span className="text-gray-600">📦 {seller.successfulTransactions || seller.totalOrders || 0} sales</span>
                                    <span className="text-gray-600">📅 Joined {new Date(seller.createdAt).getFullYear()}</span>
                                </div>

                                {/* Verification badges */}
                                <div className="flex gap-2 mt-3">
                                    {seller.isMobileVerified && (
                                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">📱 Mobile</span>
                                    )}
                                    {seller.isLocationVerified && (
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">📍 Location</span>
                                    )}
                                    {seller.isDocumentVerified && (
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">🛡️ Aadhaar</span>
                                    )}
                                </div>
                            </div>
                            <Link
                                to={`/seller/profile/${seller._id}`}
                                className="btn-secondary text-sm px-4 py-2"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
                        <span className="text-sm text-gray-400">{reviews.length} reviews</span>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="space-y-5">
                            {reviews.map((review) => (
                                <div key={review.id} className="flex gap-4 pb-5 border-b border-gray-50 last:border-0">
                                    <img
                                        src={review.buyerAvatar}
                                        alt={review.buyerName}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-gray-800">{review.buyerName}</span>
                                            <StarRating rating={review.rating} readonly size="sm" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{review.date}</span>
                                            <span>•</span>
                                            <span>{review.product}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-8">No reviews yet for this seller.</p>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ProductDetailPage;
