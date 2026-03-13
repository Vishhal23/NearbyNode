import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import orderService from '../services/orderService';
import { useCart } from '../context/CartContext';

const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const method = searchParams.get('method');

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');

    const hasAttempted = useRef(false);

    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        if (hasAttempted.current) return;
        hasAttempted.current = true;

        if (method === 'mock') {
            setStatus('success');
            setMessage('Your mock payment was successful and order is confirmed!');
            return;
        }

        if (!sessionId) {
            setStatus('error');
            setMessage('Invalid session link.');
            return;
        }

        const verify = async () => {
            try {
                await orderService.verifyPayment(sessionId, orderId);
                setStatus('success');
                setMessage('Your payment was successful and order is confirmed!');
                clearCart();
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('We could not verify your payment. Please contact support if you were charged.');
            }
        };

        verify();
    }, [sessionId, orderId, method, clearCart]);

    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">

                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
                        <p className="text-gray-500">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-500 mb-6">{message}</p>

                        <div className="flex gap-3">
                            <button onClick={() => navigate('/orders')} className="btn-primary">
                                View Orders
                            </button>
                            <button onClick={() => navigate('/buyer/home')} className="btn-secondary">
                                Continue Shopping
                            </button>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                        <p className="text-gray-500 mb-6">{message}</p>

                        <div className="flex gap-3">
                            <button onClick={() => navigate('/checkout')} className="btn-primary">
                                Back to Checkout
                            </button>
                            <button onClick={() => navigate('/buyer/home')} className="btn-secondary">
                                Go Home
                            </button>
                        </div>
                    </>
                )}

            </div>
        </MainLayout>
    );
};

export default CheckoutSuccessPage;
