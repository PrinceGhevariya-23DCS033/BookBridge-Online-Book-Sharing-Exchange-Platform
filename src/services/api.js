import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: async (bookId, type = 'sold') => {
    try {
      let cartResponse;
      
      if (type === 'secondhand' || type === 'sold') {
        // For second-hand books, the bookId is already our database book ID
        cartResponse = await api.post('/cart', { 
          book: bookId
        });
      } else {
        // For new books from Google API, create or get the book first
        const bookResponse = await booksAPI.createOrGetBook({
          googleBooksId: bookId,
          type: type,
          condition: 'new',
          status: 'available',
          isAvailable: true,
          marketplaceStatus: 'active'
        });
        
        if (!bookResponse.data || !bookResponse.data._id) {
          throw new Error('Failed to create/get book in database');
        }
        
        // Then add to cart using our database book ID
        cartResponse = await api.post('/cart', { 
          book: bookResponse.data._id
        });
      }

      return cartResponse;
    } catch (error) {
      console.error('Error in addToCart:', error);
      if (error.response?.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw error;
    }
  },
  removeFromCart: (bookId) => api.delete(`/cart/${bookId}`),
  updateQuantity: (bookId, quantity) => api.put(`/cart/${bookId}`, { quantity }),
  clearCart: () => api.delete('/cart'),
};

// Books API
export const booksAPI = {
  getBooks: () => api.get('/books'),
  getAllBooks: () => api.get('/books'),
  getBook: (id) => api.get(`/books/${id}`),
  createOrGetBook: (bookData) => api.post('/books/google', bookData),
  createBook: (bookData) => api.post('/books', bookData),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  getWishlist: () => api.get('/user/wishlist'),
  addToWishlist: (bookId) => api.post('/user/wishlist', { bookId }),
  removeFromWishlist: (bookId) => api.delete(`/user/wishlist/${bookId}`),
};

// Request API
export const requestAPI = {
  createRequest: async (formData) => {
    try {
      const response = await api.post('/requests', formData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  },
  getAllRequests: async () => {
    try {
      const response = await api.get('/requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getRequest: async (id) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateRequest: async (id, data) => {
    try {
      const response = await api.put(`/requests/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteRequest: async (id) => {
    try {
      const response = await api.delete(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDashboardRequests: async () => {
    try {
      const response = await api.get('/requests/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getMyRequests: async () => {
    try {
      const response = await api.get('/requests/my-requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSponsorRequests: async () => {
    try {
      const response = await api.get('/sponsor/requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Donation API
export const donationAPI = {
  createDonation: (formData) => api.post('/donations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAllDonations: () => api.get('/donations'),
  getMyDonations: () => api.get('/donations/my-donations'),
  getDonation: (id) => api.get(`/donations/${id}`),
  updateDonationStatus: (id, status) => api.patch(`/donations/${id}/status`, { status }),
};

// Marketplace API
export const marketplaceAPI = {
  getAllListings: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/marketplace?${queryParams.toString()}`);
  },
  getListing: (id) => api.get(`/marketplace/${id}`),
  getContactDetails: (id) => api.get(`/marketplace/${id}/contact`),
  createListing: (listingData) => {
    const formData = new FormData();
    Object.keys(listingData).forEach(key => {
      if (listingData[key] !== null && listingData[key] !== undefined) {
        formData.append(key, listingData[key]);
      }
    });
    return api.post('/marketplace/sell', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyListings: () => api.get('/marketplace/my'),
  updateListing: (id, listingData) => api.put(`/marketplace/${id}`, listingData),
  deleteListing: (id) => api.delete(`/marketplace/${id}`),
};

// Stats API
export const statsAPI = {
  getUserStats: () => api.get('/stats/user'),
  getPlatformStats: () => api.get('/stats/platform'),
};

export default api; 