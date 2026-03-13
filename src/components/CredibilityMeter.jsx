import React from 'react';

/**
 * CredibilityMeter — Visual credibility score with breakdown
 * @param {number} score - Overall score (0-5)
 * @param {string} badge - Badge level (new/verified/trusted/elite)
 * @param {object} breakdown - { rating, transactions, kyc, accountAge }
 */
const CredibilityMeter = ({ score = 0, badge = 'new', breakdown }) => {
    const badgeConfig = {
        new: { label: 'New Seller', icon: '🆕', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-600', bgColor: 'bg-gray-100' },
        verified: { label: 'Verified Seller', icon: '✅', color: 'from-blue-400 to-blue-600', textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
        trusted: { label: 'Trusted Seller', icon: '⭐', color: 'from-green-400 to-emerald-600', textColor: 'text-green-600', bgColor: 'bg-green-50' },
        elite: { label: 'Elite Seller', icon: '💎', color: 'from-amber-400 to-orange-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50' },
    };

    const config = badgeConfig[badge] || badgeConfig.new;
    const percentage = Math.min((score / 5) * 100, 100);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <p className={`font-semibold text-sm ${config.textColor}`}>{config.label}</p>
                        <p className="text-xs text-gray-400">Credibility Score</p>
                    </div>
                </div>
                <div className={`text-3xl font-bold ${config.textColor}`}>
                    {score.toFixed(1)}
                    <span className="text-sm text-gray-400 font-normal">/5.0</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-4">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${config.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Breakdown */}
            {breakdown && (
                <div className="grid grid-cols-2 gap-3">
                    <BreakdownItem label="Avg Rating" value={breakdown.rating?.toFixed(1) || '0.0'} icon="⭐" weight="40%" />
                    <BreakdownItem label="Transactions" value={breakdown.transactions || 0} icon="📦" weight="30%" />
                    <BreakdownItem label="KYC Level" value={breakdown.kyc ? 'Verified' : 'Pending'} icon="🛡️" weight="20%" />
                    <BreakdownItem label="Account Age" value={`${breakdown.accountAge || 0}d`} icon="📅" weight="10%" />
                </div>
            )}
        </div>
    );
};

const BreakdownItem = ({ label, value, icon, weight }) => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
        <span className="text-sm">{icon}</span>
        <div className="flex-1">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
        </div>
        <span className="text-xs text-gray-400">{weight}</span>
    </div>
);

export default CredibilityMeter;
