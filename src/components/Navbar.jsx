import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, userProfile, logout } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const storedUser = (() => {
        try {
            const raw = localStorage.getItem('nn_user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();
    const userRole = storedUser?.role || 'buyer';

    const navLinks = [
        { to: '/buyer/home', label: 'Browse' },
        { to: '/seller/profile', label: 'Sellers' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setDropdownOpen(false);
        setMenuOpen(false);
        await logout();
        navigate('/login');
    };

    // Generate avatar initials for phone-auth users (no displayName)
    const getInitials = (displayName) => {
        if (!displayName) return '?';
        return displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                            <span className="text-white font-bold text-sm">NN</span>
                        </div>
                        <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            NearbyNode
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${location.pathname === link.to
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Cart + Auth Section */}
                    <div className="hidden md:flex items-center gap-3">
                        {user && (
                            <Link to="/cart" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        {user ? (
                            /* ── Logged In: Avatar dropdown ── */
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200"
                                >
                                    {/* Avatar */}
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-100">
                                            {getInitials(user.displayName || user.phoneNumber)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                                        {user.displayName || user.phoneNumber || 'User'}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 py-2 z-50 animate-fadeIn">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                                            <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
                                                {user.displayName || user.phoneNumber || 'User'}
                                            </p>
                                            {userProfile?.location && (
                                                <p className="text-xs text-gray-400 mt-0.5">📍 {userProfile.location}</p>
                                            )}
                                        </div>

                                        {/* ── Buyer Section ── */}
                                        {(userRole === 'buyer' || userRole === 'admin') && (
                                            <>
                                                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">🛍️ Buyer</p>
                                                <Link
                                                    to="/buyer/home"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <span>🏠</span> Browse Products
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <span>📋</span> My Orders
                                                </Link>
                                                <Link
                                                    to="/cart"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <span>🛒</span> Cart
                                                </Link>
                                            </>
                                        )}

                                        {/* ── Seller Section ── */}
                                        {(userRole === 'seller' || userRole === 'admin') && (
                                            <>
                                                <div className="border-t border-gray-100 mt-1"></div>
                                                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">🏪 Seller</p>
                                                <Link
                                                    to="/seller/dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                >
                                                    <span>📊</span> Dashboard
                                                </Link>
                                                <Link
                                                    to="/seller/add-product"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                >
                                                    <span>➕</span> Add Product
                                                </Link>
                                                <Link
                                                    to="/seller/orders"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                >
                                                    <span>📬</span> Orders Received
                                                </Link>
                                                <Link
                                                    to="/seller/listings"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                >
                                                    <span>📦</span> My Listings
                                                </Link>
                                            </>
                                        )}

                                        {/* ── Admin Section ── */}
                                        {userRole === 'admin' && (
                                            <>
                                                <div className="border-t border-gray-100 mt-1"></div>
                                                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">🛡️ Admin</p>
                                                <Link
                                                    to="/admin/verify"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                >
                                                    <span>✅</span> Verification Panel
                                                </Link>
                                            </>
                                        )}

                                        {/* ── Account ── */}
                                        <div className="border-t border-gray-100 mt-1"></div>
                                        <Link
                                            to="/profile/edit"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            <span>✏️</span> Edit Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <span>🚪</span> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Logged Out: Login / Register ── */
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary py-2 px-5 text-sm"
                                >
                                    Register Free
                                </Link>
                                <Link
                                    to="/seller/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                                >
                                    Seller Hub
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <div className={`w-6 h-5 flex flex-col justify-between transition-all duration-300 ${menuOpen ? 'gap-0' : 'gap-1'}`}>
                            <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                            <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                            <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fadeIn">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-gray-100">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-xs font-bold">
                                                {getInitials(user.displayName || user.phoneNumber)}
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold text-gray-700 truncate">
                                            {user.displayName || user.phoneNumber || 'User'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full mt-1 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg text-left font-medium transition-colors"
                                    >
                                        🚪 Sign Out
                                    </button>
                                    <Link
                                        to="/profile/edit"
                                        onClick={() => setMenuOpen(false)}
                                        className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                                    >
                                        ✏️ Edit Profile
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">
                                        Log In
                                    </Link>
                                    <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm text-center">
                                        Seller Hub
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
