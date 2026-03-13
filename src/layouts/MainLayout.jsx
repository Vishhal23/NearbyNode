import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * MainLayout — wraps public-facing pages with Navbar + Footer
 */
const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
