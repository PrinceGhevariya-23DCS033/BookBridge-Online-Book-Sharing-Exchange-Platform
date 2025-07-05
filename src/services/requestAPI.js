import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const requestAPI = {
  // Get all requests for sponsor page
  getSponsorRequests: async () => {
    try {
      console.log('Fetching sponsor requests from API...');
      const response = await axios.get(`${API_URL}/sponsor/requests`);
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
      const response = await axios.post(`${API_URL}/requests`, formData, {
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
      const response = await axios.get(`${API_URL}/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getRequestDetails:', error);
      throw error;
    }
  },

  // Update request status
  updateRequestStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/requests/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error in updateRequestStatus:', error);
      throw error;
    }
  }
};

export default requestAPI; 