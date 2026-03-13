import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { to: '/seller/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/seller/add-product', icon: '➕', label: 'Add Product' },
    { to: '/seller/listings', icon: '📦', label: 'My Listings' },
    { to: '/orders', icon: '📋', label: 'Orders' },
    { to: '/seller/profile', icon: '👤', label: 'My Profile' },
    { to: '/buyer/home', icon: '🛍️', label: 'Browse Market' },
    { to: '/admin/verify', icon: '🛡️', label: 'Admin Panel' },
];

/**
 * Sidebar — left navigation panel for Seller/Admin dashboards
 * @param {boolean} collapsed - optional collapse flag
 */
const Sidebar = ({ collapsed = false }) => {
    const location = useLocation();

    return (
        <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 min-h-screen flex flex-col transition-all duration-300 flex-shrink-0`}>
            {/* Sidebar Header */}
            <div className={`px-4 py-5 border-b border-gray-800 ${collapsed ? 'flex justify-center' : ''}`}>
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">NN</span>
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-white text-lg">NearbyNode</span>
                    )}
                </Link>
            </div>

            {/* Seller Info */}
            {!collapsed && (
                <div className="px-4 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            P
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-sm font-semibold truncate">Priya Sharma</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <p className="text-green-400 text-xs">Trust Score: 92%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Items */}
            <nav className="flex-1 p-3 space-y-1" role="navigation">
                {!collapsed && (
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-2">
                        Navigation
                    </p>
                )}
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className={`text-lg transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                            {!collapsed && isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-800">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 group w-full"
                    >
                        <span className="text-lg">🚪</span>
                        <span className="text-sm font-medium">Logout</span>
                    </Link>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
