import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/products', icon: '📦', label: 'Product Approval' },
    { to: '/admin/kyc', icon: '🪪', label: 'KYC Verification' },
    { to: '/admin/fraud', icon: '🚨', label: 'Fraud Reports' },
    { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const adminName = user?.displayName || user?.name || 'Admin';
    const adminEmail = user?.email || 'admin@test.com';

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                ${collapsed ? 'w-[72px]' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                bg-gray-900 flex flex-col transition-all duration-300 flex-shrink-0
            `}>
                {/* Logo */}
                <div className={`px-4 py-5 border-b border-gray-800 ${collapsed ? 'flex justify-center' : ''}`}>
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-bold text-xs">⚙️</span>
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-white text-lg">Admin Panel</span>
                        )}
                    </Link>
                </div>

                {/* Admin Info */}
                {!collapsed && (
                    <div className="px-4 py-4 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-sm font-semibold truncate">{adminName}</p>
                                <p className="text-gray-400 text-xs truncate">{adminEmail}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {!collapsed && (
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-2">
                            Management
                        </p>
                    )}
                    {adminNavItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
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
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                {!collapsed && (
                    <div className="p-4 border-t border-gray-800 space-y-1">
                        <Link
                            to="/seller/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 w-full"
                        >
                            <span className="text-lg">🛍️</span>
                            <span className="text-sm font-medium">Seller Portal</span>
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 w-full"
                        >
                            <span className="text-lg">🚪</span>
                            <span className="text-sm font-medium">Back to Site</span>
                        </Link>
                    </div>
                )}
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 sticky top-0 z-30 shadow-sm">
                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                setMobileOpen(!mobileOpen);
                            } else {
                                setCollapsed(!collapsed);
                            }
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-sm font-semibold text-red-600">Admin Panel</span>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:block">{adminEmail}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                            {adminName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
