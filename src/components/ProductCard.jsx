import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TrustBadge from './TrustBadge';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { getCategoryImage } from '../assets/categoryImages';

/**
 * ProductCard — displays a product in the buyer grid
 * @param {object} product - product data object from mockData
 */
const ProductCard = ({ product }) => {
    // MongoDB schemas typically use _id, title, imageUrls
    const id = product._id || product.id;
    const name = product.title || product.name || 'Unnamed Product';
    const price = product.price || 0;
    const image = (product.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls[0]
        : (product.imageUrl || product.image || getCategoryImage(product.category));
    const category = product.category || 'Uncategorized';

    // Seller can be populated object or string/ID
    const sellerObj = product.seller || {};
    const sellerName = sellerObj.businessName || sellerObj.name || (typeof sellerObj === 'string' ? sellerObj : 'Unknown Seller');
    const sellerId = sellerObj._id || sellerObj.id || sellerObj;

    const rating = product.averageRating || product.rating || 0;
    const reviews = product.totalRatings || product.reviews || 0;
    const isTrustVerified = sellerObj.isVerified || product.isTrustVerified || false;

    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id,
            name,
            price,
            image,
            seller: sellerName,
            sellerId: sellerId,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <Link to={`/product/${id}`} className="block">
            <div className="card card-hover group flex flex-col overflow-hidden p-0 rounded-2xl">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                        onError={(e) => {
                            e.target.src = getCategoryImage(category);
                        }}
                    />
                    {/* Trust badge overlay */}
                    {isTrustVerified && (
                        <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                                🛡️ Verified
                            </span>
                        </div>
                    )}
                    {/* Category tag */}
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium rounded-full shadow-sm">
                            {category}
                        </span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-200">
                        {name}
                    </h3>

                    {/* Ratings */}
                    <div className="flex items-center gap-2">
                        <StarRating rating={rating} readonly size="sm" />
                        <span className="text-sm font-medium text-gray-800">{rating}</span>
                        <span className="text-xs text-gray-400">({reviews})</span>
                    </div>

                    {/* Seller */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {sellerName.charAt(0).toUpperCase()}
                        </span>
                        <span className="hover:text-blue-600 transition-colors truncate">
                            {sellerName}
                        </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <span className="text-xl font-bold text-gray-900">₹{price}</span>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${added
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {added ? '✓ Added' : '🛒 Add'}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
