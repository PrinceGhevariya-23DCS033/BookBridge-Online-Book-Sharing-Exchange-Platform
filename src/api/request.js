import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const requestAPI = {
  // Get all requests for sponsor page
  getSponsorRequests: async () => {
    try {
      console.log('Making request to /api/sponsor/requests');
      const response = await axios.get(`${API_URL}/sponsor/requests`);
      console.log('Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error in getSponsorRequests:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Other API methods...
};

export default requestAPI; 