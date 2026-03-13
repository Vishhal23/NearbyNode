import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">NN</span>
                            </div>
                            <span className="text-xl font-bold text-white">NearbyNode</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            India's most trusted local C2C marketplace, empowering micro-sellers to grow with verified trust scores.
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors duration-200">
                                <span className="text-xs font-bold">f</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-sky-500 flex items-center justify-center cursor-pointer transition-colors duration-200">
                                <span className="text-xs font-bold">tw</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-pink-500 flex items-center justify-center cursor-pointer transition-colors duration-200">
                                <span className="text-xs font-bold">in</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Marketplace</h4>
                        <ul className="space-y-2">
                            {['Browse Products', 'Sellers Near You', 'Categories', 'Deals'].map((item) => (
                                <li key={item}>
                                    <Link to="/buyer/home" className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Seller Section */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">For Sellers</h4>
                        <ul className="space-y-2">
                            {['Start Selling', 'Seller Dashboard', 'Trust Verification', 'Pricing'].map((item) => (
                                <li key={item}>
                                    <Link to="/register" className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <span className="flex items-center gap-2">
                                    <span className="text-green-400">📍</span> New Delhi, India
                                </span>
                            </li>
                            <li>
                                <span className="flex items-center gap-2">
                                    <span className="text-green-400">📞</span> +91 98765 43210
                                </span>
                            </li>
                            <li>
                                <span className="flex items-center gap-2">
                                    <span className="text-green-400">✉️</span> help@nearbynode.in
                                </span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-green-900/40 border border-green-800/50 rounded-xl">
                            <p className="text-xs text-green-300 flex items-center gap-1.5">
                                <span>🛡️</span> All sellers are identity-verified for your safety.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                        © 2026 NearbyNode. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
