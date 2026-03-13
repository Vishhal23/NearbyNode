import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { user, dbUser, loading: authLoading, loginWithGoogle, sendOtp, verifyOtp, loginWithEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // If already logged in, redirect immediately (wait for sync if loading)
    useEffect(() => {
        if (!authLoading && user && dbUser) {
            const from = location.state?.from?.pathname || (dbUser.role === 'seller' ? '/seller/dashboard' : '/buyer/home');
            navigate(from, { replace: true });
        }
    }, [user, dbUser, authLoading, navigate, location]);

    // ── State ────────────────────────────────────────────────────
    const [tab, setTab] = useState('email'); // 'email' | 'phone'
    const [role, setRole] = useState('buyer'); // Added role switch for testing login override
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(0);

    const otpRefs = useRef([]);
    const recaptchaContainerId = 'recaptcha-container';

    useEffect(() => {
        if (timer > 0) {
            const t = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [timer]);

    // ── Google Sign-In ───────────────────────────────────────────
    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            sessionStorage.setItem('pending_role', role); // Let logins override role
            await loginWithGoogle();
        } catch (err) {
            setError(err.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    // ── Email/Password Log-In ────────────────────────────────────
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setLoading(true);
        try {
            sessionStorage.setItem('pending_role', role); // Let logins override role
            await loginWithEmail(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Send OTP ─────────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!phoneNumber.trim()) {
            setError('Please enter your phone number.');
            return;
        }
        const formatted = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;
        setLoading(true);
        try {
            sessionStorage.setItem('pending_role', role);
            const result = await sendOtp(formatted, recaptchaContainerId);
            setConfirmationResult(result);
            setStep('otp');
            setTimer(60);
            setSuccess('OTP sent successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── OTP input handling ───────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    // ── Verify OTP ───────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await verifyOtp(confirmationResult, otpString);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setError('');
        setOtp(['', '', '', '', '', '']);
        setSuccess('');
        setLoading(true);
        try {
            const formatted = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;
            const result = await sendOtp(formatted, recaptchaContainerId);
            setConfirmationResult(result);
            setTimer(60);
            setSuccess('OTP resent!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
            <div id={recaptchaContainerId} />

            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-lg">NN</span>
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            NearbyNode
                        </span>
                    </Link>
                    <p className="mt-3 text-gray-500 text-sm">Your trusted local marketplace</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">

                    <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">Welcome back</h2>
                    <p className="text-gray-500 text-sm mb-6 text-center">Sign in to your account</p>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
                            <span className="text-green-500 mt-0.5">✅</span>
                            <p className="text-green-600 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Role Selector added to log in page to force-override role if testing */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Login as...</label>
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
                                    {r === 'buyer' ? '🛍️ Buyer' : '🏪 Seller'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">Select your role to ensure you land in the right dashboard.</p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="w-full py-3.5 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 text-gray-700 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mb-5"
                    >
                        {googleLoading ? (
                            <><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Signing in...</>
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
                        <span className="text-xs text-gray-400 font-medium">or login manually</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="flex border-b border-gray-100 mb-5">
                        <button
                            onClick={() => { setTab('email'); setError(''); setSuccess(''); }}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${tab === 'email'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Email
                        </button>
                        <button
                            onClick={() => { setTab('phone'); setError(''); setSuccess(''); }}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${tab === 'phone'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Phone OTP
                        </button>
                    </div>

                    {tab === 'email' ? (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={loading || googleLoading} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 transition-all shadow-md">
                                {loading ? 'Signing in...' : 'Sign In →'}
                            </button>
                        </form>
                    ) : (
                        <>
                            {step === 'phone' ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">+91</span>
                                            <div className="absolute left-[52px] top-1/4 bottom-1/4 w-px bg-gray-200" />
                                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="98765 43210" disabled={loading} maxLength={10} className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading || googleLoading} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 transition-all shadow-md">
                                        {loading ? 'Sending OTP...' : 'Send OTP →'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                                            <span onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }} className="text-xs text-blue-500 hover:text-blue-700 font-medium cursor-pointer">← Change number</span>
                                        </div>
                                        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                            {otp.map((digit, i) => (
                                                <input key={i} ref={(el) => (otpRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} disabled={loading} className="w-11 h-13 py-3 text-center text-lg font-bold rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 transition-all" />
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-sm hover:from-green-700 hover:to-green-600 transition-all shadow-md mt-2">
                                        {loading ? 'Verifying...' : '✓ Verify OTP'}
                                    </button>
                                    <p className="text-center text-sm text-gray-400 mt-3">
                                        Didn't receive it?{' '}
                                        <button type="button" onClick={handleResend} disabled={timer > 0 || loading} className="font-semibold text-blue-500 hover:text-blue-700 disabled:text-gray-400 transition-colors">
                                            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                        </button>
                                    </p>
                                </form>
                            )}
                        </>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            New to NearbyNode?{' '}
                            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    🔐 Secured by Firebase Authentication · Your data is safe with us
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
