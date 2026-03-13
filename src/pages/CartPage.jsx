import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, deliveryCharge, grandTotal, updateQuantity, removeFromCart, cartCount } = useCart();

    if (cartItems.length === 0) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <span className="text-7xl mb-6 animate-bounce">🛒</span>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-400 mb-6 text-center">Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/buyer/home" className="btn-primary">
                        Browse Products
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                <p className="text-sm text-gray-400 mb-8">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-card p-4 sm:p-5 flex gap-4 items-start group hover:shadow-card-hover transition-all duration-200"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">by {item.seller}</p>
                                    <p className="text-lg font-bold text-gray-900 mt-2">₹{item.price}</p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors flex items-center justify-center text-sm"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors flex items-center justify-center text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <p className="text-lg font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        🗑 Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                                    <span className="font-medium text-gray-800">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className={`font-medium ${deliveryCharge === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                {deliveryCharge > 0 && (
                                    <p className="text-xs text-blue-500">
                                        💡 Add ₹{500 - cartTotal} more for free delivery
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-5">
                                <div className="flex justify-between">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Proceed to Checkout →
                            </button>

                            <Link
                                to="/buyer/home"
                                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-4 transition-colors"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CartPage;
