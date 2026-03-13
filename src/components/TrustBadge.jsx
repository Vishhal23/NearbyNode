import React from 'react';

const badgeConfig = {
    mobile: {
        label: 'Mobile Verified',
        icon: '📱',
        className: 'bg-blue-50 text-blue-700 border-blue-100',
        iconBg: 'bg-blue-100',
    },
    location: {
        label: 'Location Verified',
        icon: '📍',
        className: 'bg-green-50 text-green-700 border-green-100',
        iconBg: 'bg-green-100',
    },
    document: {
        label: 'Document Verified',
        icon: '🪪',
        className: 'bg-purple-50 text-purple-700 border-purple-100',
        iconBg: 'bg-purple-100',
    },
    trust: {
        label: 'Trusted Seller',
        icon: '🛡️',
        className: 'bg-amber-50 text-amber-700 border-amber-100',
        iconBg: 'bg-amber-100',
    },
};

/**
 * TrustBadge — renders a verification badge pill
 * @param {string} type - 'mobile' | 'location' | 'document' | 'trust'
 * @param {boolean} verified - if false, renders a dimmed unverified state
 * @param {string} size - 'sm' | 'md'
 */
const TrustBadge = ({ type = 'trust', verified = true, size = 'sm' }) => {
    const config = badgeConfig[type] || badgeConfig.trust;

    if (!verified) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-400 border-gray-100`}>
                <span className="text-sm grayscale opacity-50">{config.icon}</span>
                <span>{config.label}</span>
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className} ${size === 'md' ? 'px-3.5 py-1.5 text-sm' : ''
                }`}
        >
            <span className={`w-4 h-4 rounded-full ${config.iconBg} flex items-center justify-center text-xs`}>
                ✓
            </span>
            {config.label}
        </span>
    );
};

export default TrustBadge;
