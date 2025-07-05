import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api/cart';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch cart items on mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      // Ensure each item has priceInINR
      const itemsWithPrice = response.data.map(item => ({
        ...item,
        priceInINR: item.priceInINR || 0
      }));
      setCartItems(itemsWithPrice);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (book) => {
    try {
      setLoading(true);
      const response = await cartAPI.addToCart(book);
      // Ensure each item has priceInINR
      const itemsWithPrice = response.data.map(item => ({
        ...item,
        priceInINR: item.priceInINR || 0
      }));
      setCartItems(itemsWithPrice);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      setLoading(true);
      await cartAPI.updateQuantity(id, quantity);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id) => {
    try {
      setLoading(true);
      await cartAPI.removeFromCart(id);
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clearCart();
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (paymentDetails) => {
    try {
      setLoading(true);
      await cartAPI.checkout(paymentDetails);
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 