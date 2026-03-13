import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateSession, sendAadhaarOtp, verifyAadhaarOtp } from '../services/kycService';
import { useKYC } from '../context/KYCContext';

// ── Aadhaar masking: shows only last 4 digits ──────────────────
// Security: we NEVER store or transmit the full Aadhaar number
const maskAadhaar = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    if (digits.length <= 4) return digits;
    const masked = 'X'.repeat(digits.length - 4) + digits.slice(-4);
    // Format: XXXX-XXXX-XXXX
    return masked.match(/.{1,4}/g)?.join('-') || masked;
};

const STEPS = { AADHAAR: 'aadhaar', OTP: 'otp', SUCCESS: 'success', EXPIRED: 'expired' };

const HyperVergeKYC = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { updateKYC, setKycLoading } = useKYC();

    const [step, setStep] = useState(STEPS.AADHAAR);
    const [aadhaarInput, setAadhaarInput] = useState('');      // raw digits only, cleared after send
    const [otp, setOtp] = useState('');
    const [referenceId, setReferenceId] = useState('');        // Sandbox.co.in reference_id
    const [kycResult, setKycResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionData, setSessionData] = useState(null);

    // ── Validate session on mount ──────────────────────────────
    useEffect(() => {
        const session = validateSession(sessionId);
        if (!session) {
            setStep(STEPS.EXPIRED);
        } else {
            setSessionData(session);
        }
    }, [sessionId]);

    // Aadhaar input: digits only, max 12
    const handleAadhaarChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
        setAadhaarInput(digits);
        setError('');
    };

    // ── Send OTP ───────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (aadhaarInput.length !== 12) {
            setError('Please enter your complete 12-digit Aadhaar number.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Send Aadhaar number to proxy → Sandbox.co.in → UIDAI
            const response = await sendAadhaarOtp(aadhaarInput);
            setReferenceId(response.reference_id);  // Store reference_id for OTP verification
            setAadhaarInput('');                     // Discard Aadhaar immediately — security rule
            setStep(STEPS.OTP);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Verify OTP ─────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        if (!referenceId) {
            setError('Session reference missing. Please restart the KYC process.');
            return;
        }
        setError('');
        setLoading(true);
        setKycLoading(true);
        try {
            const result = await verifyAadhaarOtp(sessionId, otp, referenceId);
            setOtp('');           // Discard OTP immediately after use
            setKycResult(result);
            updateKYC(result);    // Save ONLY: status, provider, referenceId, verifiedAt
            setStep(STEPS.SUCCESS);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setKycLoading(false);
        }
    };

    const goToProfile = () => navigate('/seller/profile', { replace: true });

    // ── Expired Session Screen ─────────────────────────────────
    if (step === STEPS.EXPIRED) {
        return (
            <KYCShell>
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⏱️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Your KYC session has expired or is invalid. Please start the verification again.
                    </p>
                    <button onClick={goToProfile} className="btn-hv-primary">
                        Back to Profile
                    </button>
                </div>
            </KYCShell>
        );
    }

    return (
        <KYCShell>
            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-8">
                {[STEPS.AADHAAR, STEPS.OTP, STEPS.SUCCESS].map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center gap-2 ${step === s ? 'opacity-100' : step === STEPS.SUCCESS || i < [STEPS.AADHAAR, STEPS.OTP, STEPS.SUCCESS].indexOf(step) ? 'opacity-60' : 'opacity-30'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step === STEPS.SUCCESS || i <= [STEPS.AADHAAR, STEPS.OTP].indexOf(step) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400 bg-white'}`}>
                                {step === STEPS.SUCCESS || i < [STEPS.AADHAAR, STEPS.OTP, STEPS.SUCCESS].indexOf(step) ? '✓' : i + 1}
                            </div>
                            <span className="text-xs font-medium text-gray-600 hidden sm:inline">
                                {s === STEPS.AADHAAR ? 'Aadhaar' : s === STEPS.OTP ? 'OTP' : 'Verified'}
                            </span>
                        </div>
                        {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step !== STEPS.AADHAAR && i === 0 || step === STEPS.SUCCESS && i !== 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* ── STEP 1: Aadhaar Input ──────────────────────── */}
            {step === STEPS.AADHAAR && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <span className="text-2xl">🪪</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Enter Aadhaar Number</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            An OTP will be sent to your Aadhaar-linked mobile
                        </p>
                    </div>

                    {error && <ErrorBanner message={error} />}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Aadhaar Number
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                inputMode="numeric"
                                placeholder="Enter 12-digit Aadhaar"
                                value={aadhaarInput}
                                onChange={handleAadhaarChange}
                                disabled={loading}
                                autoComplete="off"
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-mono text-lg tracking-widest transition-all"
                            />
                            {/* Real-time masking display */}
                            {aadhaarInput.length > 0 && (
                                <div className="mt-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                                    <p className="text-xs text-blue-600 font-medium mb-0.5">Masked Preview</p>
                                    <p className="font-mono text-blue-800 text-sm font-semibold tracking-widest">
                                        {maskAadhaar(aadhaarInput)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                            <span>🔒</span>
                            Your Aadhaar number is never stored. Only verification result is saved.
                        </p>
                    </div>

                    <button type="submit" disabled={loading || aadhaarInput.length !== 12} className="btn-hv-primary w-full">
                        {loading ? <Spinner label="Sending OTP…" /> : 'Send OTP via UIDAI →'}
                    </button>
                </form>
            )}

            {/* ── STEP 2: OTP Input ──────────────────────────── */}
            {step === STEPS.OTP && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <span className="text-2xl">📲</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Enter OTP</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            OTP sent to Aadhaar-linked mobile number
                        </p>
                    </div>

                    {error && <ErrorBanner message={error} />}

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 flex gap-2">
                        <span className="text-lg">ℹ️</span>
                        <span><strong>Demo mode:</strong> Enter any 6-digit number (e.g. <strong>123456</strong>) to simulate verification.</span>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            6-Digit OTP
                        </label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="••••••"
                            value={otp}
                            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                            disabled={loading}
                            autoComplete="one-time-code"
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-gray-900 font-mono text-2xl text-center tracking-[0.5em] transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                            <span>🔒</span> OTP is never stored — discarded immediately after verification.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setStep(STEPS.AADHAAR); setOtp(''); setError(''); }}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-40"
                        >
                            ← Back
                        </button>
                        <button type="submit" disabled={loading || otp.length !== 6} className="flex-2 flex-1 btn-hv-primary">
                            {loading ? <Spinner label="Verifying…" /> : 'Verify OTP ✓'}
                        </button>
                    </div>
                </form>
            )}

            {/* ── STEP 3: Success ────────────────────────────── */}
            {step === STEPS.SUCCESS && kycResult && (
                <div className="text-center">
                    {/* Success animation */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 animate-bounce-once">
                        <span className="text-5xl">✅</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Aadhaar Verified!</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Your identity has been successfully verified via HyperVerge
                    </p>

                    {/* Reference Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100 rounded-2xl p-5 text-left mb-6 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference ID</span>
                            <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg text-sm">
                                {kycResult.kycReferenceId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Provider</span>
                            <span className="font-semibold text-gray-800">{kycResult.kycProvider}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified On</span>
                            <span className="text-gray-800 text-sm">
                                {new Date(kycResult.verifiedAt).toLocaleString('en-IN', {
                                    dateStyle: 'medium', timeStyle: 'short'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                            <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                                {kycResult.kycStatus}
                            </span>
                        </div>
                    </div>

                    <button onClick={goToProfile} className="btn-hv-primary w-full mb-2">
                        View Seller Profile →
                    </button>
                    <p className="text-xs text-gray-400">
                        Your Trust Score has been updated with +25 points for Aadhaar verification
                    </p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                    🎓 KYC flow simulated for academic demonstration. · Not a real HyperVerge integration.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Session ID: <code className="font-mono">{sessionId?.slice(0, 20)}…</code>
                </p>
            </div>
        </KYCShell>
    );
};

// ── Sub-components ─────────────────────────────────────────────

const KYCShell = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            {/* HyperVerge-style header */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-blue-700 font-black text-lg">HV</span>
                </div>
                <div>
                    <p className="text-white font-bold text-lg leading-none">HyperVerge</p>
                    <p className="text-blue-300 text-xs">Secure Identity Verification</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-blue-800/60 px-3 py-1.5 rounded-full border border-blue-700">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-blue-200 text-xs font-medium">Secure</span>
                </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
                {/* NearbyNode + powered by */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">NN</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">NearbyNode</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span>🔐</span>
                        <span>256-bit encrypted</span>
                    </div>
                </div>

                {children}
            </div>
        </div>
    </div>
);

const ErrorBanner = ({ message }) => (
    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
        <span className="text-red-500 mt-0.5">⚠️</span>
        <p className="text-red-600 text-sm">{message}</p>
    </div>
);

const Spinner = ({ label }) => (
    <span className="flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        {label}
    </span>
);

// Add to index.css or inline here for the primary button
// btn-hv-primary is defined via Tailwind @apply in index.css
// Fallback inline style if not set:
const style = document.createElement('style');
style.textContent = `
.btn-hv-primary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    color: white; font-weight: 600; font-size: 0.875rem;
    border-radius: 0.75rem; border: none; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 14px rgba(37,99,235,0.3);
}
.btn-hv-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1e40af, #1d4ed8); transform: translateY(-1px); }
.btn-hv-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
@keyframes bounce-once { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
.animate-bounce-once { animation: bounce-once 0.6s ease-in-out; }
`;
if (!document.getElementById('hv-kyc-styles')) {
    style.id = 'hv-kyc-styles';
    document.head.appendChild(style);
}

export default HyperVergeKYC;
