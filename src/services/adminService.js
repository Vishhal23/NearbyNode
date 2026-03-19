import api from './api';

const adminService = {
    // Dashboard
    getStats: async () => {
        const { data } = await api.get('admin/stats');
        return data;
    },
    getRecentOrders: async () => {
        const { data } = await api.get('admin/recent-orders');
        return data;
    },
    getPendingProducts: async () => {
        const { data } = await api.get('admin/pending-products');
        return data;
    },

    // Users
    getUsers: async (params = {}) => {
        const { data } = await api.get('admin/users', { params });
        return data;
    },
    banUser: async (id) => {
        const { data } = await api.patch(`admin/users/${id}/ban`);
        return data;
    },
    flagFraud: async (id, reason) => {
        const { data } = await api.patch(`admin/users/${id}/flag-fraud`, { reason });
        return data;
    },
    clearFraud: async (id) => {
        const { data } = await api.patch(`admin/users/${id}/clear-fraud`);
        return data;
    },

    // Products
    approveProduct: async (id) => {
        const { data } = await api.patch(`admin/products/${id}/approve`);
        return data;
    },
    rejectProduct: async (id, reason) => {
        const { data } = await api.patch(`admin/products/${id}/reject`, { reason });
        return data;
    },

    // KYC
    getKycSubmissions: async () => {
        const { data } = await api.get('admin/kyc');
        return data;
    },
    approveKyc: async (id) => {
        const { data } = await api.patch(`admin/kyc/${id}/approve`);
        return data;
    },
    rejectKyc: async (id, reason) => {
        const { data } = await api.patch(`admin/kyc/${id}/reject`, { reason });
        return data;
    },

    // Fraud
    getFraudReports: async () => {
        const { data } = await api.get('admin/fraud-reports');
        return data;
    },

    // Analytics
    getAnalytics: async () => {
        const { data } = await api.get('admin/analytics');
        return data;
    },

    // Reports
    submitReport: async (reportData) => {
        const { data } = await api.post('users/report', reportData);
        return data;
    },

    // Seller KYC Submit
    submitSellerKyc: async (formData) => {
        const { data } = await api.post('users/kyc/submit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};

export default adminService;
