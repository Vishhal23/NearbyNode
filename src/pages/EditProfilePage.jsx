import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useKYC } from '../context/KYCContext';
import { initiateKYCSession } from '../services/kycService';
import { linkWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const BUSINESS_TYPES = [
    'Individual / Freelancer',
    'Sole Proprietorship',
    'Partnership Firm',
    'Private Limited Company',
    'Public Limited Company',
    'LLP (Limited Liability Partnership)',
    'NGO / Trust',
    'Other',
];

// ── Small reusable badge ────────────────────────────────────────────────────
const VerifyBadge = ({ verified, label }) => (
    <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${verified
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-400'
            }`}
    >
        {verified ? '✅' : '○'} {label}
    </span>
);

// ── Verification row ────────────────────────────────────────────────────────
const VerifyRow = ({ icon, title, subtitle, verified, action }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${verified ? 'bg-green-100' : 'bg-gray-100'
                    }`}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
        {verified ? (
            <span className="shrink-0 flex items-center gap-1.5 text-green-700 text-xs font-bold bg-green-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Verified
            </span>
        ) : (
            action
        )}
    </div>
);

// ── Section tab button ──────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
    >
        {label}
    </button>
);

// ── Input helper ────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
    <div>
        <label className="block text-xs text-gray-500 font-medium mb-1.5">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-white';

// ────────────────────────────────────────────────────────────────────────────

const EditProfilePage = () => {
    const { user, dbUser, userProfile, updateUserProfile } = useAuth();
    const { kycData, isKYCVerified, kycLoading } = useKYC();
    const navigate = useNavigate();

    const sections = dbUser?.role === 'seller'
        ? ['Profile', 'Verification', 'Business', 'Account']
        : ['Profile', 'Verification', 'Account'];

    const [activeSection, setActiveSection] = useState('Profile');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [kycStarting, setKycStarting] = useState(false);
    const [phoneInput, setPhoneInput] = useState(dbUser?.phone || '');
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [googleLinking, setGoogleLinking] = useState(false);

    // ── Image upload state ────────────────────────────────────────────────────
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    // ── Location picker state ─────────────────────────────────────────────────
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [locationSearching, setLocationSearching] = useState(false);
    const [geoLocating, setGeoLocating] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef(null);
    const locationWrapperRef = useRef(null);

    // ── Form state ───────────────────────────────────────────────────────────
    const [profile, setProfile] = useState({
        displayName: '',
        photoURL: '',
        bio: '',
        location: '',
    });

    const [business, setBusiness] = useState({
        businessName: '',
        businessType: '',
        gstin: '',
        pan: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        website: '',
        description: '',
    });

    // Populate from existing data
    useEffect(() => {
        setProfile({
            displayName: user?.displayName || '',
            photoURL: user?.photoURL || '',
            bio: userProfile?.bio || '',
            location: userProfile?.location || '',
        });
        if (userProfile?.business) {
            setBusiness((prev) => ({ ...prev, ...userProfile.business }));
        }
    }, [user, userProfile]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Derived verification flags ───────────────────────────────────────────
    const isGoogleLinked = user?.providerData?.some(
        (p) => p.providerId === 'google.com'
    );
    const isPhoneVerified = !!user?.phoneNumber || !!dbUser?.phone;

    // ── Image upload handler (base64 — no Firebase Storage needed) ─────────────
    const cancelUpload = () => {
        setUploading(false);
        setUploadProgress(0);
        showToast('error', 'Upload cancelled.');
    };

    const processFileUpload = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('error', 'Please select an image file (JPG, PNG, GIF, WebP).');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            showToast('error', `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadProgress(30);
            const img = new Image();
            img.onload = () => {
                setUploadProgress(50);
                // Resize to max 400px for a small, fast profile picture
                const MAX_DIM = 400;
                let { width, height } = img;
                if (width > MAX_DIM || height > MAX_DIM) {
                    if (width > height) {
                        height = Math.round(height * MAX_DIM / width);
                        width = MAX_DIM;
                    } else {
                        width = Math.round(width * MAX_DIM / height);
                        height = MAX_DIM;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                setUploadProgress(70);

                // Convert to compressed JPEG data URL
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setUploadProgress(90);

                // Check size — Firestore docs are limited to 1 MB
                const sizeKB = Math.round(dataUrl.length / 1024);
                if (sizeKB > 800) {
                    // Try lower quality
                    const smallerUrl = canvas.toDataURL('image/jpeg', 0.4);
                    if (smallerUrl.length / 1024 > 800) {
                        showToast('error', 'Image still too large after compression. Please use a smaller image.');
                        setUploading(false);
                        setUploadProgress(0);
                        return;
                    }
                    setProfile((p) => ({ ...p, photoURL: smallerUrl }));
                } else {
                    setProfile((p) => ({ ...p, photoURL: dataUrl }));
                }

                setUploadProgress(100);
                setUploading(false);
                showToast('success', `Photo ready (${sizeKB} KB)! Don't forget to save your profile. 📸`);
            };
            img.onerror = () => {
                showToast('error', 'Failed to read image. Please try a different file.');
                setUploading(false);
                setUploadProgress(0);
            };
            img.src = ev.target.result;
        };
        reader.onerror = () => {
            showToast('error', 'Failed to read file. Please try again.');
            setUploading(false);
            setUploadProgress(0);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        processFileUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = ''; // allow re-select
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        processFileUpload(file);
    };

    const handleRemovePhoto = () => {
        setProfile((p) => ({ ...p, photoURL: '' }));
        showToast('success', 'Photo removed. Save profile to apply.');
    };

    // ── Location search (Nominatim) ────────────────────────────────────────────
    const searchLocation = (query) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query || query.length < 3) {
            setLocationSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setLocationSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data = await res.json();
                const suggestions = data.map((item) => {
                    const parts = [];
                    const a = item.address || {};
                    if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
                    if (a.state_district && !parts.includes(a.state_district)) parts.push(a.state_district);
                    if (a.state) parts.push(a.state);
                    if (a.country) parts.push(a.country);
                    return {
                        display: item.display_name,
                        short: parts.length > 0 ? parts.join(', ') : item.display_name.split(',').slice(0, 3).join(',').trim(),
                        lat: item.lat,
                        lon: item.lon,
                    };
                });
                setLocationSuggestions(suggestions);
                setShowSuggestions(suggestions.length > 0);
            } catch {
                setLocationSuggestions([]);
            } finally {
                setLocationSearching(false);
            }
        }, 400); // debounce 400ms
    };

    const handleLocationInputChange = (e) => {
        const val = e.target.value;
        setProfile((p) => ({ ...p, location: val }));
        searchLocation(val);
    };

    const handleSelectSuggestion = (suggestion) => {
        setProfile((p) => ({ ...p, location: suggestion.short }));
        setLocationSuggestions([]);
        setShowSuggestions(false);
    };

    // ── Geolocation (detect current location) ─────────────────────────────────
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast('error', 'Geolocation is not supported by your browser.');
            return;
        }
        setGeoLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const a = data.address || {};
                    const parts = [];
                    if (a.suburb || a.neighbourhood) parts.push(a.suburb || a.neighbourhood);
                    if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
                    if (a.state) parts.push(a.state);
                    const loc = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',').trim();
                    setProfile((p) => ({ ...p, location: loc }));
                    showToast('success', 'Location detected! 📍');
                } catch {
                    showToast('error', 'Could not fetch address. Try typing manually.');
                } finally {
                    setGeoLocating(false);
                }
            },
            (err) => {
                setGeoLocating(false);
                if (err.code === 1) showToast('error', 'Location access denied. Please allow it in browser settings.');
                else showToast('error', 'Could not detect your location. Try typing manually.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (locationWrapperRef.current && !locationWrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleProfileChange = (e) =>
        setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleBusinessChange = (e) =>
        setBusiness((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateUserProfile({
                displayName: profile.displayName.trim(),
                photoURL: profile.photoURL.trim(),
                bio: profile.bio.trim(),
                location: profile.location.trim(),
            });
            showToast('success', 'Profile updated! ✅');
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBusiness = async (e) => {
        e.preventDefault();
        if (!business.businessName || !business.businessType) {
            showToast('error', 'Business name and type are required.');
            return;
        }
        setSaving(true);
        try {
            await updateUserProfile({ business });
            showToast('success', 'Business details saved! 🏪');
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStartKYC = async () => {
        setKycStarting(true);
        try {
            const { initiateKYCSession } = await import('../services/kycService');
            const session = await initiateKYCSession(user?.uid || 'demo-user');
            navigate(session.redirectUrl);
        } catch (err) {
            showToast('error', 'Failed to start KYC. Please try again.');
        } finally {
            setKycStarting(false);
        }
    };

    const handleStartPhoneVerify = async () => {
        if (!phoneInput || phoneInput.length < 10) {
            showToast('error', 'Please enter a valid 10-digit mobile number.');
            return;
        }
        setPhoneLoading(true);
        try {
            const formatted = phoneInput.startsWith('+') ? phoneInput : `+91${phoneInput}`;
            const confirmationResult = await sendOtp(formatted, 'recaptcha-container-profile');
            navigate('/verify-otp', {
                state: {
                    confirmationResult,
                    phone: formatted,
                }
            });
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setPhoneLoading(false);
        }
    };

    const handleLinkGoogle = async () => {
        setGoogleLinking(true);
        try {
            await linkWithPopup(auth.currentUser, googleProvider);
            showToast('success', 'Google account linked! 🔵');
        } catch (err) {
            if (err.code === 'auth/credential-already-in-use') {
                showToast('error', 'This Google account is already linked to another user.');
            } else if (err.code === 'auth/provider-already-linked') {
                showToast('success', 'Google account is already linked ✅');
            } else {
                showToast('error', err.message || 'Failed to link Google.');
            }
        } finally {
            setGoogleLinking(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    };

    // ── Completion trackers ───────────────────────────────────────────────
    const profileComplete = profile.displayName && profile.bio && profile.location;
    const verifyComplete = isKYCVerified && isGoogleLinked && isPhoneVerified;
    const businessComplete =
        business.businessName && business.businessType && business.addressLine1 && business.city;

    const completionItems = [
        { label: 'Profile Info', done: !!profileComplete },
        { label: 'Aadhaar KYC', done: isKYCVerified },
        { label: 'Google Link', done: isGoogleLinked },
        { label: 'Phone Verified', done: isPhoneVerified },
    ];

    if (dbUser?.role === 'seller') {
        completionItems.push({ label: 'Business Details', done: !!businessComplete });
    }

    const completedCount = completionItems.filter((i) => i.done).length;
    const completionPct = Math.round((completedCount / completionItems.length) * 100);

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
                    >
                        ← Back
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {profile.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    alt="avatar"
                                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-100 shadow"
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-xl font-bold ring-4 ring-blue-100 shadow">
                                    {getInitials(profile.displayName || user?.phoneNumber)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                            <p className="text-gray-400 text-sm mt-0.5 capitalize">
                                {dbUser?.role || 'User'} account · {completedCount}/{completionItems.length} complete
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-gray-400 font-medium">Profile Completion</span>
                            <span className="text-xs font-bold text-blue-600">{completionPct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${completionPct}%` }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {completionItems.map((item) => (
                                <VerifyBadge key={item.label} label={item.label} verified={item.done} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fadeIn ${toast.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {toast.msg}
                    </div>
                )}

                {/* Tab Bar */}
                <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 rounded-2xl flex-wrap">
                    {sections.map((s) => (
                        <Tab
                            key={s}
                            label={s}
                            active={activeSection === s}
                            onClick={() => setActiveSection(s)}
                        />
                    ))}
                </div>

                {/* ── SECTION: Profile ──────────────────────────────────────── */}
                {activeSection === 'Profile' && (
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        {/* Avatar Upload */}
                        <div className="card p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Profile Picture</h2>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="avatar-upload"
                            />

                            <div className="flex flex-col sm:flex-row items-start gap-5">
                                {/* Preview */}
                                <div className="shrink-0 relative group">
                                    {profile.photoURL ? (
                                        <>
                                            <img
                                                src={profile.photoURL}
                                                alt="Avatar preview"
                                                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-100 shadow-md transition-all"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            {/* Remove overlay */}
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove photo"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-100 shadow-md">
                                            {getInitials(profile.displayName || user?.phoneNumber)}
                                        </div>
                                    )}
                                </div>

                                {/* Upload zone */}
                                <div className="flex-1 w-full">
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all ${dragActive
                                            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                            } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
                                    >
                                        {uploading ? (
                                            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                                <div className="text-sm font-semibold text-blue-600">
                                                    📤 Uploading… {uploadProgress}%
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={cancelUpload}
                                                    className="mt-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                                >
                                                    ✕ Cancel Upload
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-3xl mb-1">📷</div>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    Click to upload or drag & drop
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    JPG, PNG, GIF, WebP · Max 5 MB
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Actions row */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            📁 Choose File
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowUrlInput(!showUrlInput)}
                                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            🔗 {showUrlInput ? 'Hide' : 'Use'} URL instead
                                        </button>
                                        {profile.photoURL && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePhoto}
                                                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Collapsible URL fallback */}
                                    {showUrlInput && (
                                        <div className="mt-3 animate-fadeIn">
                                            <Field label="Image URL" hint="Paste a direct link to your image">
                                                <input
                                                    type="url"
                                                    name="photoURL"
                                                    value={profile.photoURL}
                                                    onChange={handleProfileChange}
                                                    placeholder="https://example.com/photo.jpg"
                                                    className={inputCls}
                                                />
                                            </Field>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="card p-6 space-y-5">
                            <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>

                            <Field label="Display Name" required>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={profile.displayName}
                                    onChange={handleProfileChange}
                                    required
                                    placeholder="Your full name"
                                    className={inputCls}
                                />
                            </Field>

                            <Field label="Location">
                                <div ref={locationWrapperRef} className="relative">
                                    {/* Input row */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📍</span>
                                            <input
                                                type="text"
                                                name="location"
                                                value={profile.location}
                                                onChange={handleLocationInputChange}
                                                onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                                                placeholder="Search city, area, or pincode…"
                                                autoComplete="off"
                                                className={`${inputCls} pl-9 pr-8`}
                                            />
                                            {locationSearching && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <span className="block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleUseCurrentLocation}
                                            disabled={geoLocating}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:from-blue-100 hover:to-green-100 transition-all disabled:opacity-60"
                                            title="Detect current location"
                                        >
                                            {geoLocating ? (
                                                <><span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Detecting…</>
                                            ) : (
                                                <><span className="text-base">🎯</span> Use Current<span className="hidden sm:inline"> Location</span></>
                                            )}
                                        </button>
                                    </div>

                                    {/* Suggestions dropdown */}
                                    {showSuggestions && locationSuggestions.length > 0 && (
                                        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
                                            {locationSuggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(s)}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 group"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-blue-400 text-sm mt-0.5 shrink-0 group-hover:text-blue-600">📍</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{s.short}</p>
                                                            <p className="text-xs text-gray-400 truncate mt-0.5">{s.display}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                            <div className="px-4 py-1.5 bg-gray-50 text-[10px] text-gray-400 text-right">
                                                Powered by OpenStreetMap
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Field>

                            <Field label="Bio" hint={`${profile.bio.length}/200 characters`}>
                                <textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleProfileChange}
                                    rows={3}
                                    maxLength={200}
                                    placeholder="Tell buyers a bit about yourself..."
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {saving ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                ) : '💾 Save Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* ── SECTION: Verification ─────────────────────────────────── */}
                {activeSection === 'Verification' && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                            Complete verifications to boost your Trust Score
                        </p>

                        {/* Aadhaar KYC */}
                        <VerifyRow
                            icon="🪪"
                            title="Aadhaar KYC"
                            subtitle={
                                isKYCVerified
                                    ? `Verified via ${kycData?.kycProvider} · Ref: ${kycData?.kycReferenceId}`
                                    : 'Boosts Trust Score by +25 points'
                            }
                            verified={isKYCVerified}
                            action={
                                <button
                                    onClick={handleStartKYC}
                                    disabled={kycStarting || kycLoading}
                                    className="shrink-0 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold hover:from-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-60 flex items-center gap-1.5"
                                >
                                    {kycStarting ? (
                                        <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting…</>
                                    ) : 'Verify Now →'}
                                </button>
                            }
                        />

                        {/* Google */}
                        <VerifyRow
                            icon="🔵"
                            title="Google Account"
                            subtitle={
                                isGoogleLinked
                                    ? `Linked as ${user?.email || 'Google user'}`
                                    : 'Link your Google account for trust verification (+10 pts)'
                            }
                            verified={isGoogleLinked}
                            action={
                                <button
                                    onClick={handleLinkGoogle}
                                    disabled={googleLinking}
                                    className="shrink-0 py-2 px-4 rounded-xl border border-blue-200 text-blue-600 bg-blue-50 text-xs font-semibold hover:bg-blue-100 transition-all disabled:opacity-60 flex items-center gap-1.5"
                                >
                                    {googleLinking ? (
                                        <><span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Linking…</>
                                    ) : 'Link Google →'}
                                </button>
                            }
                        />

                        {/* Phone */}
                        <div id="recaptcha-container-profile" />
                        <VerifyRow
                            icon="📱"
                            title="Mobile Number"
                            subtitle={
                                isPhoneVerified
                                    ? `Verified · ${user.phoneNumber || dbUser?.phone}`
                                    : 'Phone verification required for phone sign-in (+15 pts)'
                            }
                            verified={isPhoneVerified}
                            action={
                                isPhoneVerified ? null : (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="tel"
                                            value={phoneInput}
                                            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Mobile Number"
                                            className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-400 w-32"
                                            maxLength={10}
                                        />
                                        <button
                                            onClick={handleStartPhoneVerify}
                                            disabled={phoneLoading}
                                            className="shrink-0 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold hover:from-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-60 flex items-center gap-1.5"
                                        >
                                            {phoneLoading ? (
                                                <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                                            ) : 'Verify →'}
                                        </button>
                                    </div>
                                )
                            }
                        />

                        {/* Summary card */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-800">🛡️ Trust Score Impact</span>
                                <span className="text-xl font-extrabold text-blue-700">
                                    {(isKYCVerified ? 25 : 0) + (isPhoneVerified ? 15 : 0) + (isGoogleLinked ? 10 : 0)}
                                    <span className="text-sm font-normal text-gray-400">/50 pts</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Aadhaar KYC', pts: 25, done: isKYCVerified },
                                    { label: 'Phone', pts: 15, done: isPhoneVerified },
                                    { label: 'Google', pts: 10, done: isGoogleLinked },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className={`text-center p-2 rounded-xl text-xs ${item.done ? 'bg-white/80' : 'bg-gray-100/60 opacity-60'}`}
                                    >
                                        <div className="font-bold text-gray-900">
                                            +{item.pts}<span className="text-gray-400 font-normal"> pts</span>
                                        </div>
                                        <div className="text-gray-500 mt-0.5">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SECTION: Business ─────────────────────────────────────── */}
                {activeSection === 'Business' && (
                    <form onSubmit={handleSaveBusiness} className="space-y-5">
                        {/* Basic Business Info */}
                        <div className="card p-6 space-y-5">
                            <h2 className="text-sm font-semibold text-gray-700">Business Information</h2>

                            <Field label="Business / Shop Name" required>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={business.businessName}
                                    onChange={handleBusinessChange}
                                    placeholder="e.g. Priya's Organic Farm"
                                    className={inputCls}
                                />
                            </Field>

                            <Field label="Business Type" required>
                                <select
                                    name="businessType"
                                    value={business.businessType}
                                    onChange={handleBusinessChange}
                                    className={inputCls}
                                >
                                    <option value="">Select business type…</option>
                                    {BUSINESS_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Business Description" hint="What do you sell? Who are your customers?">
                                <textarea
                                    name="description"
                                    value={business.description}
                                    onChange={handleBusinessChange}
                                    rows={3}
                                    placeholder="Brief description of your business…"
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>

                            <Field label="Website / Social Link" hint="Optional">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔗</span>
                                    <input
                                        type="url"
                                        name="website"
                                        value={business.website}
                                        onChange={handleBusinessChange}
                                        placeholder="https://yourbusiness.com"
                                        className={`${inputCls} pl-9`}
                                    />
                                </div>
                            </Field>
                        </div>

                        {/* Tax & Legal */}
                        <div className="card p-6 space-y-5">
                            <h2 className="text-sm font-semibold text-gray-700">Tax & Legal</h2>

                            <Field label="GSTIN" hint="15-character GST Identification Number (optional if exempt)">
                                <input
                                    type="text"
                                    name="gstin"
                                    value={business.gstin}
                                    onChange={handleBusinessChange}
                                    placeholder="e.g. 29ABCDE1234F1Z5"
                                    maxLength={15}
                                    className={`${inputCls} font-mono uppercase`}
                                    style={{ letterSpacing: '0.05em' }}
                                />
                            </Field>

                            <Field label="PAN Number" hint="Permanent Account Number">
                                <input
                                    type="text"
                                    name="pan"
                                    value={business.pan}
                                    onChange={handleBusinessChange}
                                    placeholder="e.g. ABCDE1234F"
                                    maxLength={10}
                                    className={`${inputCls} font-mono uppercase`}
                                    style={{ letterSpacing: '0.05em' }}
                                />
                            </Field>
                        </div>

                        {/* Business Address */}
                        <div className="card p-6 space-y-5">
                            <h2 className="text-sm font-semibold text-gray-700">Business Address</h2>

                            <Field label="Address Line 1" required>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={business.addressLine1}
                                    onChange={handleBusinessChange}
                                    placeholder="Building / House No., Street Name"
                                    className={inputCls}
                                />
                            </Field>

                            <Field label="Address Line 2" hint="Area, Landmark (optional)">
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={business.addressLine2}
                                    onChange={handleBusinessChange}
                                    placeholder="Landmark, area, etc."
                                    className={inputCls}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="City" required>
                                    <input
                                        type="text"
                                        name="city"
                                        value={business.city}
                                        onChange={handleBusinessChange}
                                        placeholder="e.g. Mumbai"
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="State">
                                    <input
                                        type="text"
                                        name="state"
                                        value={business.state}
                                        onChange={handleBusinessChange}
                                        placeholder="e.g. Maharashtra"
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            <Field label="PIN Code">
                                <input
                                    type="text"
                                    name="pincode"
                                    value={business.pincode}
                                    onChange={handleBusinessChange}
                                    placeholder="6-digit PIN"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    className={`${inputCls} font-mono`}
                                />
                            </Field>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {saving ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                ) : '🏪 Save Business Details'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* ── SECTION: Account ──────────────────────────────────────── */}
                {activeSection === 'Account' && (
                    <div className="space-y-4">
                        <div className="card p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Account Details</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'User ID', value: user?.uid, mono: true },
                                    { label: 'Email', value: user?.email || '—' },
                                    { label: 'Phone', value: user?.phoneNumber || '—' },
                                    { label: 'Auth Provider', value: user?.providerData?.map((p) => p.providerId).join(', ') || '—' },
                                    {
                                        label: 'Account Created',
                                        value: user?.metadata?.creationTime
                                            ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { dateStyle: 'long' })
                                            : '—',
                                    },
                                    {
                                        label: 'Last Sign-In',
                                        value: user?.metadata?.lastSignInTime
                                            ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN', { dateStyle: 'long' })
                                            : '—',
                                    },
                                ].map(({ label, value, mono }) => (
                                    <div
                                        key={label}
                                        className="flex items-start justify-between gap-4 py-2.5 px-4 bg-gray-50 rounded-xl"
                                    >
                                        <span className="text-xs text-gray-400 font-medium shrink-0">{label}</span>
                                        <span
                                            className={`text-sm text-gray-700 font-medium text-right break-all ${mono ? 'font-mono text-xs' : ''}`}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="card p-6 border-red-100">
                            <h2 className="text-sm font-semibold text-red-600 mb-3">⚠️ Danger Zone</h2>
                            <p className="text-xs text-gray-400 mb-4">
                                These actions are permanent and cannot be undone.
                            </p>
                            <button
                                type="button"
                                className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all"
                                onClick={() => alert('Account deletion would require email confirmation in production.')}
                            >
                                🗑️ Request Account Deletion
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default EditProfilePage;
