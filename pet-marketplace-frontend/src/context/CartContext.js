import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });

  // Load cart from backend or localStorage on mount or login
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          const res = await userAPI.getCart();
          console.log('Loaded cart from backend:', res.data);
          setCart(res.data);
        } catch (e) {
          console.error('Error loading cart:', e);
          setCart({ items: [], total: 0 });
        }
      } else {
        const stored = localStorage.getItem('cart');
        setCart(stored ? JSON.parse(stored) : { items: [], total: 0 });
      }
    };
    loadCart();
  }, [isAuthenticated]);

  // Save cart to backend or localStorage when cart changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Saving cart to backend:', cart);
      userAPI.setCart(cart).catch(e => {
        console.error('Error saving cart:', e);
      });
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.product._id === product._id);
      let newItems;
      
      if (existingItem) {
        newItems = prev.items.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev.items, { product, quantity: 1 }];
      }

      const total = newItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );

      const newCart = { items: newItems, total };
      console.log('addToCart: new cart state:', newCart, isAuthenticated ? 'Saving to backend' : 'Saving to localStorage');
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.product._id !== productId);
      const total = newItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      return { items: newItems, total };
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      );
      
      const total = newItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      
      return { items: newItems, total };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}; 