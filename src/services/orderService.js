import api from './api';

const orderService = {
    create: async (orderData) => {
        const { data } = await api.post('/orders', orderData);
        return data;
    },

    getMyOrders: async () => {
        const { data } = await api.get('/orders/my');
        return data;
    },

    getSellerOrders: async () => {
        const { data } = await api.get('/orders/seller');
        return data;
    },

    getById: async (id) => {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },

    updateStatus: async (id, status, note = '') => {
        const { data } = await api.put(`/orders/${id}/status`, { status, note });
        return data;
    },

    verifyPayment: async (sessionId, orderId) => {
        const { data } = await api.post('/orders/verify-payment', { session_id: sessionId, order_id: orderId });
        return data;
    },
};

export default orderService;
