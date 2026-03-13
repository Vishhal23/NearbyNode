import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Guards routes based on authentication & role.
 *
 * Props:
 *   - children: React nodes to render if authorized
 *   - allowedRoles: Optional array of allowed roles (e.g., ['seller', 'admin']).
 *                   If omitted, any authenticated user can access the route.
 *
 * Usage:
 *   <ProtectedRoute>                                 — any logged-in user
 *   <ProtectedRoute allowedRoles={['seller']}>       — sellers only
 *   <ProtectedRoute allowedRoles={['admin']}>        — admins only
 *   <ProtectedRoute allowedRoles={['seller','admin']}>— sellers & admins
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Read role from the local storage backend user data
    const storedUser = (() => {
        try {
            const raw = localStorage.getItem('nn_user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    <p className="text-gray-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access control
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = storedUser?.role || 'buyer';
        if (!allowedRoles.includes(userRole)) {
            // Redirect to appropriate home based on their actual role
            const roleRedirects = {
                buyer: '/buyer/home',
                seller: '/seller/dashboard',
                admin: '/admin/verify',
            };
            return <Navigate to={roleRedirects[userRole] || '/'} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
