import React from 'react';

/**
 * StatusBadge — Verification status indicator
 * @param {string} status - 'none', 'pending', 'verified', 'rejected'
 */
const StatusBadge = ({ status = 'none' }) => {
    const config = {
        none: { label: 'Not Verified', icon: '○', className: 'bg-gray-100 text-gray-500' },
        pending: { label: 'Pending', icon: '⏳', className: 'bg-amber-50 text-amber-600' },
        verified: { label: 'Verified', icon: '✅', className: 'bg-green-50 text-green-600' },
        rejected: { label: 'Rejected', icon: '❌', className: 'bg-red-50 text-red-600' },
    };

    const { label, icon, className } = config[status] || config.none;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
            {icon} {label}
        </span>
    );
};

export default StatusBadge;
