import api from './api';

const authService = {
    register: async (name, email, password, role = 'buyer') => {
        const { data } = await api.post('auth/register', { name, email, password, role });
        if (data.success) {
            localStorage.setItem('nn_token', data.data.token);
            localStorage.setItem('nn_user', JSON.stringify(data.data));
        }
        return data;
    },

    login: async (email, password) => {
        const { data } = await api.post('auth/login', { email, password });
        if (data.success) {
            localStorage.setItem('nn_token', data.data.token);
            localStorage.setItem('nn_user', JSON.stringify(data.data));
        }
        return data;
    },

    getMe: async () => {
        const { data } = await api.get('auth/me');
        return data;
    },

    logout: () => {
        localStorage.removeItem('nn_token');
        localStorage.removeItem('nn_user');
    },

    getStoredUser: () => {
        const user = localStorage.getItem('nn_user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('nn_token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('nn_token');
    },
};

export default authService;
