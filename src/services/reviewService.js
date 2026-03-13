import api from './api';

const reviewService = {
    getSellerReviews: async (sellerId, page = 1) => {
        const { data } = await api.get(`/reviews/seller/${sellerId}`, { params: { page } });
        return data;
    },

    getProductReviews: async (productId) => {
        const { data } = await api.get(`/reviews/product/${productId}`);
        return data;
    },

    create: async (reviewData) => {
        const { data } = await api.post('/reviews', reviewData);
        return data;
    },
};

export default reviewService;
