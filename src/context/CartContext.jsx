import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    // Load from localStorage whenever user changes
    useEffect(() => {
        const cartKey = `nn_cart_${user?.uid || 'guest'}`;
        const stored = localStorage.getItem(cartKey);
        if (!stored) {
            setCartItems([]);
            return;
        }
        try {
            const items = JSON.parse(stored);
            // Clear out legacy mock data IDs (which are numbers or short strings) to prevent ObjectId cast errors
            setCartItems(items.filter(i => typeof i.id === 'string' && i.id.length === 24));
        } catch {
            setCartItems([]);
        }
    }, [user?.uid]);

    // Persist to localStorage
    useEffect(() => {
        const cartKey = `nn_cart_${user?.uid || 'guest'}`;
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }, [cartItems, user?.uid]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = cartTotal < 500 && cartTotal > 0 ? 40 : 0;
    const grandTotal = cartTotal + deliveryCharge;

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        deliveryCharge,
        grandTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
