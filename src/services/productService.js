import api from './api';

const productService = {
    getAll: async (params = {}) => {
        const { data } = await api.get('/products', { params });
        return data;
    },

    search: async (query, page = 1) => {
        const { data } = await api.get('/products/search', { params: { q: query, page } });
        return data;
    },

    getById: async (id) => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },

    create: async (productData) => {
        const { data } = await api.post('/products', productData);
        return data;
    },

    update: async (id, productData) => {
        const { data } = await api.put(`/products/${id}`, productData);
        return data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/products/${id}`);
        return data;
    },

    getSellerProducts: async (sellerId) => {
        const { data } = await api.get('/products', { params: { seller: sellerId } });
        return data;
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
};

export default productService;
