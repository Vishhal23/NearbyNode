/**
 * KYCContext.jsx — KYC State Management
 *
 * Stores ONLY the verification result — never Aadhaar or OTP.
 * In production: kycData would be read from / written to Firestore.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const KYCContext = createContext(null);

export const useKYC = () => {
    const ctx = useContext(KYCContext);
    if (!ctx) throw new Error('useKYC must be used within KYCProvider');
    return ctx;
};

export const KYCProvider = ({ children }) => {
    /**
     * kycData shape (never contains Aadhaar number):
     * {
     *   kycStatus: 'Verified' | 'Pending' | 'Failed' | null,
     *   kycProvider: 'HyperVerge',
     *   kycReferenceId: 'HV-XXXXXX',
     *   verifiedAt: ISO timestamp,
     * }
     */
    const [kycData, setKycData] = useState(() => {
        // Persist across page reloads via localStorage (demo only)
        // In production: read from Firestore user document
        try {
            const stored = localStorage.getItem('nearbynode_kyc');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [kycLoading, setKycLoading] = useState(false);

    // Called after successful webhook simulation
    const updateKYC = useCallback(async (webhookPayload) => {
        // Store ONLY safe, non-sensitive fields
        const safeData = {
            kycStatus: webhookPayload.kycStatus,
            kycProvider: webhookPayload.kycProvider,
            kycReferenceId: webhookPayload.kycReferenceId,
            verifiedAt: webhookPayload.verifiedAt,
        };
        setKycData(safeData);
        localStorage.setItem('nearbynode_kyc', JSON.stringify(safeData));

        // Sync with MongoDB backend so the seller actually gets verified platform-wide
        try {
            await fetch(import.meta.env.VITE_API_URL + '/users/kyc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('nn_token')}`
                },
                body: JSON.stringify({
                    aadhaarVerified: webhookPayload.kycStatus === 'Verified'
                })
            });
        } catch (err) {
            console.error('Failed to sync KYC status to backend:', err);
        }
    }, []);

    const resetKYC = useCallback(() => {
        setKycData(null);
        localStorage.removeItem('nearbynode_kyc');
    }, []);

    const isKYCVerified = kycData?.kycStatus === 'Verified';

    return (
        <KYCContext.Provider value={{
            kycData,
            kycLoading,
            setKycLoading,
            updateKYC,
            resetKYC,
            isKYCVerified,
        }}>
            {children}
        </KYCContext.Provider>
    );
};

export default KYCContext;
