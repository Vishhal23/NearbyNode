import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, dbUser, loading: authLoading, loginWithGoogle, sendOtp, registerWithEmail } = useAuth();

    const [tab, setTab] = useState('email'); // 'email' | 'phone'
    const [role, setRole] = useState('buyer');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    // If already logged in AND we have dbUser, redirect based on role
    useEffect(() => {
        if (!authLoading && user && dbUser) {
            if (dbUser.role === 'seller') {
                navigate('/seller/dashboard', { replace: true });
            } else {
                navigate('/buyer/home', { replace: true });
            }
        }
    }, [user, dbUser, authLoading, navigate]);

    // ── Google Sign-Up ───────────────────────────────────────────
    const handleGoogleSignUp = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            sessionStorage.setItem('pending_role', role);
            await loginWithGoogle();
        } catch (err) {
            setError(err.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    // ── Email Sign-Up ────────────────────────────────────────────
    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim()) {
            setError('Please enter your full name.');
            return;
        }

        setLoading(true);
        try {
            sessionStorage.setItem('pending_role', role);
            sessionStorage.setItem('pending_name', fullName.trim());
            await registerWithEmail(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Phone OTP Send ───────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim()) {
            setError('Please enter your full name.');
            return;
        }
        if (!phone.trim()) {
            setError('Please enter your phone number.');
            return;
        }
        const formatted = phone.startsWith('+') ? phone.trim() : `+91${phone.trim()}`;

        setLoading(true);
        try {
            const confirmationResult = await sendOtp(formatted, 'recaptcha-container-register');
            navigate('/verify-otp', {
                state: { confirmationResult, fullName, phone: formatted, role },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
            <div id="recaptcha-container-register" />

            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">

                    <div className="text-center mb-6">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <span className="text-white font-bold">NN</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">NearbyNode</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-500 text-sm mt-1">Join thousands of verified sellers & buyers</p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Role Selector First */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {['buyer', 'seller'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${role === r
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {r === 'buyer' ? '🛍️ Buy' : '🏪 Sell'}
                                </button>
                            ))}
                        </div>
                        <div className={`mt-2 p-2 rounded-lg text-xs border ${role === 'seller'
                            ? 'bg-blue-50 border-blue-100 text-blue-700'
                            : 'bg-green-50 border-green-100 text-green-700'
                            }`}>
                            {role === 'seller'
                                ? "🏪 Sellers complete identity verification to list products."
                                : "🛍️ Buyers browse and purchase from verified local sellers."}
                        </div>
                    </div>

                    {/* Google Sign-Up taking the role */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={googleLoading || loading}
                        className="w-full py-3.5 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 text-gray-700 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mb-5"
                    >
                        {googleLoading ? (
                            <><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Signing up...</>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="relative flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium">or register manually</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Tab switcher */}
                    <div className="flex border-b border-gray-100 mb-5">
                        <button
                            onClick={() => { setTab('email'); setError(''); }}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${tab === 'email'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Email
                        </button>
                        <button
                            onClick={() => { setTab('phone'); setError(''); }}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${tab === 'phone'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Phone OTP
                        </button>
                    </div>

                    {/* Form */}
                    {tab === 'email' ? (
                        <form onSubmit={handleEmailSignUp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="At least 6 characters" minLength="6" />
                            </div>
                            <button type="submit" disabled={loading || googleLoading} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 transition-all shadow-md">
                                {loading ? 'Creating account...' : 'Create Account →'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">+91</span>
                                    <div className="absolute left-[52px] top-1/4 bottom-1/4 w-px bg-gray-200" />
                                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} disabled={loading} className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" placeholder="98765 43210" maxLength={10} />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">We'll send an OTP to verify your number</p>
                            </div>
                            <button type="submit" disabled={loading || googleLoading} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 transition-all shadow-md flex items-center justify-center">
                                {loading ? 'Sending OTP...' : 'Send OTP →'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
