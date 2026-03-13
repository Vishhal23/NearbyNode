import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';
import { categories } from '../assets/mockData';
import productService from '../services/productService';

const BuyerHomePage = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState('default');

    // Backend state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getAll();
                // Ensure array, maybe nested behind data
                setProducts(response.data || response || []);
            } catch (err) {
                console.error("Failed to load products:", err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filtered = products
        .filter((p) => {
            const q = search.toLowerCase();
            const sellerName = p.seller?.businessName || p.seller?.name || p.seller || '';
            const matchSearch = String(p.title || p.name).toLowerCase().includes(q) || String(sellerName).toLowerCase().includes(q);
            const matchCategory = selectedCategory === 'All Categories' ||
                p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                selectedCategory.toLowerCase().includes(p.category?.toLowerCase()) ||
                p.category?.toLowerCase().includes(selectedCategory.toLowerCase());
            return matchSearch && matchCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });

    return (
        <MainLayout>
            {/* Hero Search Bar */}
            <section className="bg-gradient-to-r from-blue-700 to-blue-800 py-10 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-white text-3xl font-bold mb-2">
                        Find Verified Local Products
                    </h1>
                    <p className="text-blue-200 text-sm mb-6">All sellers are identity-verified 🛡️</p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Search products, sellers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 border-2 border-transparent"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Filters & Sorting */}
            <section className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
                    {/* Categories */}
                    <div className="flex gap-1.5 flex-wrap flex-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="default">Sort: Default</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>
            </section>

            {/* Product Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-gray-500 text-sm">
                        Showing <span className="font-semibold text-gray-900">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
                        {selectedCategory !== 'All Categories' && (
                            <span> in <span className="font-medium text-blue-600">{selectedCategory}</span></span>
                        )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        All sellers verified
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((product) => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-6xl mb-4">🔍</span>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-400 text-sm">Try a different search term or category.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory('All Categories'); }}
                            className="btn-primary mt-5"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>
        </MainLayout>
    );
};

export default BuyerHomePage;
