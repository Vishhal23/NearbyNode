import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const trustFeatures = [
    {
        icon: '📱',
        title: 'Mobile Verified',
        description: 'Every seller verifies their mobile number via OTP — no fake accounts, ever.',
        color: 'from-blue-50 to-blue-100 border-blue-200',
        iconBg: 'bg-blue-100',
    },
    {
        icon: '📍',
        title: 'Location Verified',
        description: 'GPS-confirmed seller locations ensure you buy from genuine local sources.',
        color: 'from-green-50 to-green-100 border-green-200',
        iconBg: 'bg-green-100',
    },
    {
        icon: '🪪',
        title: 'Document Verified',
        description: 'Aadhaar/PAN document checks validate real identities through admin review.',
        color: 'from-purple-50 to-purple-100 border-purple-200',
        iconBg: 'bg-purple-100',
    },
    {
        icon: '⭐',
        title: 'Community Ratings',
        description: 'Transparent star ratings and reviews keep the marketplace honest.',
        color: 'from-amber-50 to-amber-100 border-amber-200',
        iconBg: 'bg-amber-100',
    },
];

const stats = [
    { value: '12,000+', label: 'Verified Sellers' },
    { value: '85,000+', label: 'Products Listed' },
    { value: '4.8/5', label: 'Avg Trust Rating' },
    { value: '98%', label: 'Happy Buyers' },
];

const LandingPage = () => {
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-40 -left-24 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        {/* Trust indicator */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm font-medium mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            India's Most Trusted C2C Marketplace
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                            Buy Local.{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                                Sell Trusted.
                            </span>
                        </h1>

                        <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
                            Discover verified micro-sellers in your area. Every seller is identity-checked so you shop with complete confidence.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/buyer/home" className="btn-primary text-base px-8 py-3.5 bg-green-500 hover:bg-green-600 border-0">
                                Start Shopping ➜
                            </Link>
                            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm text-base">
                                Become a Seller
                            </Link>
                        </div>

                        {/* Trust badges row */}
                        <div className="flex flex-wrap gap-3 mt-8">
                            {['📱 OTP Verified', '📍 GPS Confirmed', '🪪 ID Checked', '⭐ Rated & Reviewed'].map((badge) => (
                                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-blue-100 backdrop-blur-sm">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60L1440 60L1440 0C1200 40 900 60 720 40C540 20 240 0 0 20L0 60Z" fill="#f9fafb" />
                    </svg>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center p-4">
                                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Features Section */}
            <section className="py-16 lg:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
                            🛡️ Trust-First Platform
                        </div>
                        <h2 className="section-title">Why Buyers Trust NearbyNode</h2>
                        <p className="section-subtitle max-w-2xl mx-auto">
                            We put safety first with a multi-layer verification system so you can buy with peace of mind.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trustFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                className={`p-6 rounded-2xl border bg-gradient-to-br ${feature.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                            >
                                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="section-title">Start in 3 Easy Steps</h2>
                        <p className="section-subtitle">For sellers — get verified and start earning in minutes</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Register Free', desc: 'Sign up with your mobile number and get OTP verified instantly.', icon: '📲' },
                            { step: '02', title: 'Upload Documents', desc: 'Submit your Aadhaar or PAN for identity verification.', icon: '📄' },
                            { step: '03', title: 'List & Sell', desc: 'Add your products with photos and start receiving orders from nearby buyers.', icon: '🚀' },
                        ].map((step, i) => (
                            <div key={step.step} className="relative text-center">
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-10 left-3/4 w-1/2 h-0.5 bg-gradient-to-r from-blue-200 to-green-200"></div>
                                )}
                                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl shadow-lg mb-5 text-3xl">
                                    {step.icon}
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-200 text-xs font-bold text-blue-600 flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-14 bg-gradient-to-r from-blue-700 to-green-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Join NearbyNode?</h2>
                    <p className="text-blue-100 text-lg mb-8">Thousands of verified sellers are already growing their businesses. Your turn.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register" className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                            Register as Seller
                        </Link>
                        <Link to="/buyer/home" className="px-8 py-3.5 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors backdrop-blur-sm">
                            Browse Products
                        </Link>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default LandingPage;
