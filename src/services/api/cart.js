import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const cartAPI = {
  getCart: () => {
    return axios.get(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  addToCart: (book) => {
    return axios.post(
      `${API_URL}/cart`,
      { book },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },

  updateQuantity: (id, quantity) => {
    return axios.put(
      `${API_URL}/cart/${id}`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },

  removeFromCart: (id) => {
    return axios.delete(`${API_URL}/cart/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  clearCart: () => {
    return axios.delete(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  checkout: (paymentDetails) => {
    return axios.post(
      `${API_URL}/cart/checkout`,
      paymentDetails,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },
}; 