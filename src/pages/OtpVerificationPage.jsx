import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp, sendOtp, dbUser } = useAuth();

    // State passed from RegisterPage
    const { confirmationResult: initialConfirmation, phone } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [confirmationResult, setConfirmationResult] = useState(initialConfirmation || null);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef([]);

    // If navigated here directly without state, go back to register
    useEffect(() => {
        if (!initialConfirmation && !phone) {
            navigate('/register', { replace: true });
        }
    }, [initialConfirmation, phone, navigate]);

    // Countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer]);

    // Role-aware redirection
    useEffect(() => {
        if (verified && dbUser) {
            const target = dbUser.role === 'seller' ? '/seller/dashboard' : '/buyer/home';
            const timer = setTimeout(() => navigate(target, { replace: true }), 1500);
            return () => clearTimeout(timer);
        }
    }, [verified, dbUser, navigate]);

    const handleInput = (index, val) => {
        const char = val.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);
        setError('');
        if (char && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError('Please enter all 6 digits.');
            return;
        }
        if (!confirmationResult) {
            setError('Session expired. Please go back and request a new OTP.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await verifyOtp(confirmationResult, otpString);
            setVerified(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setError('');
        setOtp(['', '', '', '', '', '']);
        setLoading(true);
        try {
            const result = await sendOtp(phone, 'recaptcha-container-otp');
            setConfirmationResult(result);
            setResendTimer(60);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div id="recaptcha-container-otp" />
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">📲</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Mobile</h1>
                    <p className="text-gray-500 text-sm mb-1">We sent a 6-digit OTP to</p>
                    <p className="font-semibold text-gray-800 mb-6">{phone || '+91 XXXXXXXXXX'}</p>
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-left">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                    {verified && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-2 text-green-700 font-medium">
                            <span>✅</span> Verified! Redirecting...
                        </div>
                    )}
                    <form onSubmit={handleVerify}>
                        <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleInput(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    disabled={loading || verified}
                                    autoFocus={i === 0}
                                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200 ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-900'} focus:border-blue-500 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200`}
                                />
                            ))}
                        </div>
                        <button type="submit" disabled={loading || verified} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-sm hover:from-green-700 hover:to-green-600 transition-all shadow-md shadow-green-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4">
                            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</> : verified ? 'Verified ✓' : 'Verify OTP'}
                        </button>
                    </form>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <span>Didn't receive the OTP?</span>
                        {resendTimer > 0 ? <span className="text-gray-400">Resend in <span className="font-semibold text-blue-600">{resendTimer}s</span></span> : <button onClick={handleResend} disabled={loading} className="text-blue-600 font-semibold hover:underline disabled:text-gray-400">Resend OTP</button>}
                    </div>
                    <Link to="/register" className="block mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors">← Change mobile number</Link>
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationPage;
