import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses
apiClient.interceptors.response.use(
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

const requestAPI = {
  // Get all requests for sponsor page
  getSponsorRequests: async () => {
    try {
      console.log('Fetching sponsor requests from API...');
      const response = await apiClient.get('/sponsor/requests');
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getSponsorRequests:', error);
      throw error;
    }
  },

  // Create a new book request
  createRequest: async (formData) => {
    try {
      console.log('Creating new request with data:', formData);
      const response = await apiClient.post('/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Create request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createRequest:', error);
      throw error;
    }
  },

  // Get request details
  getRequestDetails: async (id) => {
    try {
      const response = await apiClient.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getRequestDetails:', error);
      throw error;
    }
  },

  // Update request status
  updateRequestStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/requests/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error in updateRequestStatus:', error);
      throw error;
    }
  },

  // Update sponsor request status (approve/reject)
  updateSponsorRequestStatus: async (id, status) => {
    try {
      console.log('Updating sponsor request status:', id, status);
      const response = await apiClient.patch(`/sponsor/requests/${id}/status`, { status });
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateSponsorRequestStatus:', error);
      throw error;
    }
  }
};

export default requestAPI; 