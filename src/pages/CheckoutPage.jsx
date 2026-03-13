import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, deliveryCharge, grandTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('stripe');

    const [form, setForm] = useState({
        fullName: user?.displayName || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) newErrors.phone = 'Valid 10-digit phone is required';
        if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!form.city.trim()) newErrors.city = 'City is required';
        if (!form.state.trim()) newErrors.state = 'State is required';
        if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Valid 6-digit pincode is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate() || isProcessing) return;

        setIsProcessing(true);
        setErrors({});

        try {
            // Transform cartItems to match backend structure
            // We assume cartItem has { id, name, price, quantity, sellerId, image }
            const items = cartItems.map(item => ({
                product: item.id,
                seller: item.sellerId,
                title: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.image
            }));

            const orderData = {
                items,
                shippingAddress: {
                    fullName: form.fullName,
                    phone: form.phone,
                    addressLine1: form.addressLine1,
                    addressLine2: form.addressLine2,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode
                },
                paymentMethod: paymentMethod
            };

            const response = await orderService.create(orderData);

            if (response.checkoutUrl) {
                // Redirect to Stripe
                window.location.href = response.checkoutUrl;
            } else {
                setOrderPlaced(true);
                clearCart();
                // Route to unified success page
                navigate(`/checkout/success?order_id=${response.data._id}&method=mock`);
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            setErrors({ submit: error.response?.data?.message || 'Failed to place order. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

                <form onSubmit={handleSubmit}>
                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                            ⚠️ {errors.submit}
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Shipping Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-5">📍 Shipping Address</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="label">Full Name</label>
                                        <input name="fullName" value={form.fullName} onChange={handleChange} className={`input-field ${errors.fullName ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="Enter your full name" />
                                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="label">Phone Number</label>
                                        <input name="phone" value={form.phone} onChange={handleChange} className={`input-field ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="10-digit phone number" maxLength={10} />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="label">Address Line 1</label>
                                        <input name="addressLine1" value={form.addressLine1} onChange={handleChange} className={`input-field ${errors.addressLine1 ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="House/flat, street name" />
                                        {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="label">Address Line 2 <span className="text-gray-400">(optional)</span></label>
                                        <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className="input-field" placeholder="Landmark, area" />
                                    </div>
                                    <div>
                                        <label className="label">City</label>
                                        <input name="city" value={form.city} onChange={handleChange} className={`input-field ${errors.city ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="City" />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="label">State</label>
                                        <input name="state" value={form.state} onChange={handleChange} className={`input-field ${errors.state ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="State" />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <label className="label">Pincode</label>
                                        <input name="pincode" value={form.pincode} onChange={handleChange} className={`input-field ${errors.pincode ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="6-digit pincode" maxLength={6} />
                                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                    </div>
                                </div>

                                {/* Payment method */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">💳 Payment Method</h3>
                                    <div className="space-y-3">
                                        {/* Stripe */}
                                        <label className={`block rounded-xl p-4 border cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-200'}`}>
                                            <div className="flex items-center gap-3 w-full">
                                                <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center text-xl">💳</div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-800">Credit / Debit Card</p>
                                                    <p className="text-xs text-gray-500">Secured by Stripe</p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Mock */}
                                        <label className={`block rounded-xl p-4 border cursor-pointer transition-all ${paymentMethod === 'mock' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-200'}`}>
                                            <div className="flex items-center gap-3 w-full">
                                                <input type="radio" name="paymentMethod" value="mock" checked={paymentMethod === 'mock'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center text-xl">🏦</div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-800">Mock Payment (Demo)</p>
                                                    <p className="text-xs text-gray-500">Auto-confirmed without real money</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                                            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4 mb-5">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${isProcessing
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Place Order — ₹${grandTotal.toLocaleString('en-IN')}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default CheckoutPage;
