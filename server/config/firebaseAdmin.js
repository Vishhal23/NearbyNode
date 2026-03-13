/**
 * Firebase Admin SDK Configuration
 * 
 * Used for server-side verification of Firebase ID tokens.
 * This ensures that auth requests are genuinely from Firebase,
 * preventing spoofed firebaseUid attacks.
 * 
 * Setup:
 *   1. Go to Firebase Console → Project Settings → Service Accounts
 *   2. Click "Generate New Private Key"
 *   3. Save the JSON file as server/config/firebase-service-account.json
 *   4. OR set FIREBASE_SERVICE_ACCOUNT_JSON env var with the JSON string
 *
 * If no credentials are provided, the server falls back to trusting
 * the client-sent UID (development/demo mode only).
 */

const admin = require('firebase-admin');

let firebaseInitialized = false;

const initializeFirebaseAdmin = () => {
    if (firebaseInitialized) return;

    try {
        // Option 1: Service account JSON file
        const path = require('path');
        const fs = require('fs');
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('🔐  Firebase Admin initialized (service account file)');
            firebaseInitialized = true;
            return;
        }

        // Option 2: Environment variable with JSON string
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('🔐  Firebase Admin initialized (env variable)');
            firebaseInitialized = true;
            return;
        }

        // Option 3: Google Cloud default credentials (for deployed envs)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp();
            console.log('🔐  Firebase Admin initialized (default credentials)');
            firebaseInitialized = true;
            return;
        }

        console.warn('⚠️  Firebase Admin not initialized — no credentials found.');
        console.warn('   Auth will use INSECURE fallback (client-trusted UID).');
        console.warn('   To fix: place firebase-service-account.json in server/config/');

    } catch (error) {
        console.warn('⚠️  Firebase Admin init error:', error.message);
        console.warn('   Auth will use INSECURE fallback mode.');
    }
};

/**
 * Verify a Firebase ID token.
 * Returns the decoded token (uid, email, etc.) or null if unverifiable.
 */
const verifyIdToken = async (idToken) => {
    if (!firebaseInitialized) return null;

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        return decoded;
    } catch (error) {
        console.error('Firebase token verification failed:', error.message);
        return null;
    }
};

const isFirebaseInitialized = () => firebaseInitialized;

module.exports = { initializeFirebaseAdmin, verifyIdToken, isFirebaseInitialized };
