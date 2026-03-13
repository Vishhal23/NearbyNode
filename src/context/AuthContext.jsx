import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    updateProfile,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [dbUser, setDbUser] = useState(null); // Start null to avoid stale role redirects
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false); // New state to track backend sync specifically
    const [userProfile, setUserProfile] = useState(null);

    // Listen to Firebase auth state changes + load Firestore profile
    useEffect(() => {
        let unsubProfile = null;

        const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                setLoading(true); // Ensure loading is true while we sync

                // Subscribe to Firestore profile document (UI/meta data)
                const profileRef = doc(db, 'users', currentUser.uid);
                unsubProfile = onSnapshot(profileRef, (snap) => {
                    if (snap.exists()) {
                        setUserProfile(snap.data());
                    } else {
                        const initial = {
                            displayName: currentUser.displayName || '',
                            photoURL: currentUser.photoURL || '',
                            bio: '',
                            location: '',
                            createdAt: new Date().toISOString(),
                        };
                        setDoc(profileRef, initial, { merge: true });
                        setUserProfile(initial);
                    }
                });

                // Sync with custom backend to get JWT and DB User Role
                try {
                    setSyncing(true);
                    const idToken = await currentUser.getIdToken();
                    const pendingRole = sessionStorage.getItem('pending_role');
                    const pendingName = sessionStorage.getItem('pending_name') || currentUser.displayName;

                    console.log(`[Auth] 🔄 Syncing with backend... (Role: ${pendingRole || 'existing'})`);

                    const res = await api.post('auth/firebase', {
                        idToken,
                        firebaseUid: currentUser.uid,
                        email: currentUser.email,
                        name: pendingName,
                        photoURL: currentUser.photoURL,
                        phone: currentUser.phoneNumber || sessionStorage.getItem('mock_phone'),
                        role: pendingRole
                    });

                    if (res.data.success) {
                        console.log('[Auth] ✅ Backend sync successful');
                        localStorage.setItem('nn_token', res.data.data.token);
                        localStorage.setItem('nn_user', JSON.stringify(res.data.data));
                        setDbUser(res.data.data);

                        sessionStorage.removeItem('pending_role');
                        sessionStorage.removeItem('pending_name');
                        sessionStorage.removeItem('mock_phone');
                    }
                } catch (error) {
                    console.error('[Auth Sync Error]', error.response?.data || error.message);
                    // Check if it's a CORS or connection error (common in deployment)
                    if (error.code === 'ERR_NETWORK') {
                        console.warn('[Auth] 🚨 Backend is unreachable. Check CORS or Render wake-up status.');
                    }
                    // If sync fails, we might still have a Firebase user but no DB record/role. 
                    // LoginPage should see dbUser is null and show error.
                } finally {
                    setSyncing(false);
                    setLoading(false);
                }

            } else {
                setUserProfile(null);
                setDbUser(null);
                localStorage.removeItem('nn_token');
                localStorage.removeItem('nn_user');
                if (unsubProfile) unsubProfile();
                setLoading(false);
                setSyncing(false);
            }
        });

        return () => {
            unsubAuth();
            if (unsubProfile) unsubProfile();
        };
    }, []);

    // ── Update User Profile ──────────────────────────────────────
    const updateUserProfile = async ({ displayName, photoURL, bio, location, business }) => {
        try {
            // Update Firebase Auth display name / photo
            const authUpdates = {};
            if (displayName !== undefined) authUpdates.displayName = displayName;
            // Only write photoURL to Firebase Auth if it's a normal URL
            // (base64 data URLs are too long for Auth's limit)
            if (photoURL !== undefined && !photoURL.startsWith('data:')) {
                authUpdates.photoURL = photoURL;
            }
            if (Object.keys(authUpdates).length > 0) {
                await updateProfile(auth.currentUser, authUpdates);
                // Keep local user state fresh
                setUser({ ...auth.currentUser });
            }

            // Update Firestore extended fields
            const profileRef = doc(db, 'users', auth.currentUser.uid);
            const firestoreUpdates = { updatedAt: new Date().toISOString() };
            if (displayName !== undefined) firestoreUpdates.displayName = displayName;
            if (photoURL !== undefined) firestoreUpdates.photoURL = photoURL;
            if (bio !== undefined) firestoreUpdates.bio = bio;
            if (location !== undefined) firestoreUpdates.location = location;
            // Business details stored as a nested map
            if (business !== undefined) firestoreUpdates.business = business;
            await setDoc(profileRef, firestoreUpdates, { merge: true });
        } catch (error) {
            throw new Error(error.message || 'Failed to update profile.');
        }
    };

    // ── Google Sign-In ──────────────────────────────────────────
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            throw new Error(getAuthErrorMessage(error.code));
        }
    };

    // ── Email/Password Auth ─────────────────────────────────────
    const registerWithEmail = async (email, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw new Error(getAuthErrorMessage(error.code));
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw new Error(getAuthErrorMessage(error.code));
        }
    };

    // ── Phone: Send OTP (Mocked for Demo) ───────────────────────
    const sendOtp = async (phoneNumber, recaptchaContainerId) => {
        try {
            // === DUMMY DEMO MODE: Bypassing Firebase SMS ===
            console.log(`[Demo Mode] OTP sent to ${phoneNumber}. Use 123456 to verify.`);
            showDemoAlert(phoneNumber);
            return { isMock: true, phone: phoneNumber };

            /* --- REAL FIREBASE CODE (Preserved) ---
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                recaptchaContainerId,
                { size: 'invisible' }
            );
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                window.recaptchaVerifier
            );
            return confirmationResult;
            ----------------------------------------- */
        } catch (error) {
            console.error('[sendOtp full error]', error);
            throw new Error(error.message || 'Failed to send OTP.');
        }
    };

    const showDemoAlert = (phone) => {
        // Just a tiny UI hint for the mentors
        alert(`DUMMY OTP SENT TO ${phone}\n\nPlease enter 123456 to verify.`);
    };

    // ── Phone: Verify OTP (Mocked for Demo) ─────────────────────
    const verifyOtp = async (confirmationResult, otp) => {
        try {
            // === DUMMY DEMO MODE: Bypassing Firebase SMS ===
            if (confirmationResult?.isMock) {
                if (otp !== '123456') {
                    throw new Error('auth/invalid-verification-code');
                }

                // Push mock phone to session so backend auth sync picks it up
                sessionStorage.setItem('mock_phone', confirmationResult.phone);

                if (auth.currentUser) {
                    // We are linking phone to an explicitly logged-in user
                    try {
                        // Immediately sync the mock phone directly to the DB so it persists
                        api.post('auth/firebase', {
                            idToken: await auth.currentUser.getIdToken(),
                            firebaseUid: auth.currentUser.uid,
                            phone: confirmationResult.phone
                        }).then((res) => {
                            if (res.data?.success) {
                                localStorage.setItem('nn_token', res.data.data.token);
                                localStorage.setItem('nn_user', JSON.stringify(res.data.data));
                                setDbUser(res.data.data);
                            }
                        });
                    } catch (e) {
                        console.error('Failed to sync dummy phone to DB on verification', e);
                    }
                    return auth.currentUser;
                } else {
                    // We are logging in solely via phone. Let's create/login a dummy email to trick Firebase into starting a valid session.
                    const spoofEmail = `${confirmationResult.phone.replace(/\D/g, '')}@mock-phone.local`;
                    const spoofPwd = 'PhonePassword123!';
                    let resultUser;
                    try {
                        const res = await signInWithEmailAndPassword(auth, spoofEmail, spoofPwd);
                        resultUser = res.user;
                    } catch (err) {
                        const res = await createUserWithEmailAndPassword(auth, spoofEmail, spoofPwd);
                        resultUser = res.user;
                    }
                    return resultUser;
                }
            }

            /* --- REAL FIREBASE CODE (Preserved) ---
            const result = await confirmationResult.confirm(otp);
            return result.user;
            ----------------------------------------- */
        } catch (error) {
            console.error('[verifyOtp full error]', error);
            throw new Error(getAuthErrorMessage(error.code || error.message));
        }
    };

    // ── Logout ──────────────────────────────────────────────────
    const logout = async () => {
        localStorage.removeItem('nn_token');
        localStorage.removeItem('nn_user');
        await signOut(auth);
    };

    // ── Human-readable error messages ───────────────────────────
    const getAuthErrorMessage = (code) => {
        console.error('[Firebase Auth Error]', code);
        const messages = {
            'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
            'auth/cancelled-popup-request': 'Only one popup allowed at a time.',
            'auth/operation-not-allowed': '⚠️ This sign-in method is not enabled in your Firebase project. Please enable Email/Password (or Phone) in the Firebase Console → Authentication → Sign-in method.',
            'auth/app-not-authorized': '⚠️ This app is not authorized. Add localhost to Firebase Authorized Domains.',
            'auth/billing-not-enabled': '⚠️ Firebase Blaze plan required for Phone Auth. Upgrade in Firebase Console.',
            'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
            'auth/invalid-phone-number': 'Invalid phone number. Use format: +91XXXXXXXXXX',
            'auth/missing-phone-number': 'Please enter a phone number.',
            'auth/invalid-verification-code': 'Incorrect OTP. Please check and retry.',
            'auth/code-expired': 'OTP has expired. Please request a new one.',
            'auth/missing-verification-code': 'Please enter the OTP.',
            'auth/session-expired': 'Session expired. Please request a new OTP.',
            'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please refresh and try again.',
            'auth/missing-client-identifier': 'reCAPTCHA not loaded. Please refresh the page.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
            'auth/internal-error': 'Firebase internal error. Check that Phone Auth is enabled in Console.',
        };
        return messages[code] || `Authentication failed (${code}). Please try again.`;
    };

    const value = {
        user,
        dbUser,
        userProfile,
        loading,
        syncing,
        loginWithGoogle,
        registerWithEmail,
        loginWithEmail,
        sendOtp,
        verifyOtp,
        logout,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
