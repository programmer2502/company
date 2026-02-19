import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) =>
                item._id === product._id &&
                item.selectedColor === product.selectedColor &&
                item.selectedSize === product.selectedSize
            );
            if (existing) {
                return prev.map((item) =>
                    (item._id === product._id &&
                        item.selectedColor === product.selectedColor &&
                        item.selectedSize === product.selectedSize)
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: product.quantity || 1 }];
        });
    };

    const removeFromCart = (id, color, size) => {
        setCart((prev) => prev.filter((item) => !(item._id === id && item.selectedColor === color && item.selectedSize === size)));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};
