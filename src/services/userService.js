import api from './api';

const userService = {
    getProfile: async (userId) => {
        const { data } = await api.get(`users/${userId}`);
        return data;
    },

    updateProfile: async (userId, updates) => {
        const { data } = await api.put(`users/${userId}`, updates);
        return data;
    },

    submitKyc: async (kycData) => {
        const { data } = await api.post('users/kyc', kycData);
        return data;
    },

    getCredibility: async (userId) => {
        const { data } = await api.get(`users/${userId}/credibility`);
        return data;
    },

    getSellers: async () => {
        const { data } = await api.get('users');
        return data;
    },
};

export default userService;
