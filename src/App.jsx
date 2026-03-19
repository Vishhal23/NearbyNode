import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { KYCProvider } from './context/KYCContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import SellerDashboard from './pages/SellerDashboard';
import AddProductPage from './pages/AddProductPage';
import BuyerHomePage from './pages/BuyerHomePage';
import PublicProfilePage from './pages/PublicProfilePage';
import SellerProfilePage from './pages/SellerProfilePage';
import AdminVerificationPanel from './pages/AdminVerificationPanel';
import HyperVergeKYC from './pages/HyperVergeKYC';
import EditProfilePage from './pages/EditProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import MyListingsPage from './pages/MyListingsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SellerOrdersPage from './pages/SellerOrdersPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductApprovalPage from './pages/admin/AdminProductApprovalPage';
import AdminKYCPage from './pages/admin/AdminKYCPage';
import AdminFraudReportsPage from './pages/admin/AdminFraudReportsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
    return (
        <AuthProvider>
            <KYCProvider>
                <CartProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/verify-otp" element={<OtpVerificationPage />} />
                            <Route path="/seller/profile/:id" element={<PublicProfilePage />} />

                            {/* Protected — Buyer */}
                            <Route
                                path="/buyer/home"
                                element={
                                    <ProtectedRoute>
                                        <BuyerHomePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/product/:id"
                                element={
                                    <ProtectedRoute>
                                        <ProductDetailPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/cart"
                                element={
                                    <ProtectedRoute>
                                        <CartPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/checkout"
                                element={
                                    <ProtectedRoute>
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/checkout/success"
                                element={
                                    <ProtectedRoute>
                                        <CheckoutSuccessPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute>
                                        <OrderHistoryPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Protected — Seller */}
                            <Route
                                path="/seller/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                        <SellerDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/seller/add-product"
                                element={
                                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                        <AddProductPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/seller/orders"
                                element={
                                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                        <SellerOrdersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/seller/listings"
                                element={
                                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                        <MyListingsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/seller/profile"
                                element={
                                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                        <SellerProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Protected — KYC (HyperVerge simulated flow) */}
                            <Route
                                path="/kyc/hyperverge-session/:sessionId"
                                element={
                                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                                        <HyperVergeKYC />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Protected — Edit Profile */}
                            <Route
                                path="/profile/edit"
                                element={
                                    <ProtectedRoute>
                                        <EditProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Protected — Admin */}
                            <Route
                                path="/admin/verify"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminVerificationPanel />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminUsersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/products"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminProductApprovalPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/kyc"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminKYCPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/fraud"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminFraudReportsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/analytics"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminAnalyticsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </CartProvider>
            </KYCProvider>
        </AuthProvider>
    );
}

export default App;
