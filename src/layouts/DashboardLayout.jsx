import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

/**
 * DashboardLayout — wraps seller/admin pages with the Sidebar
 */
const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Global Navbar */}
            <Navbar />

            {/* Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar collapsed={collapsed} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 sticky top-0 z-10 shadow-sm">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span className="text-sm text-gray-400">Seller Portal</span>
                        <div className="ml-auto flex items-center gap-3">
                            <button className="relative p-2 text-gray-500 hover:text-gray-700">
                                <span className="text-xl">🔔</span>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                                P
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
