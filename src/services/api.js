import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://84.46.251.167:8205/api', // Added port 8000 which is common for Laravel/Node backends
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false, // Set to false initially for debugging
  timeout: 10000 // 10 second timeout
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export default  {
  // GET request
  get(resource, params = {}) {
    return apiClient.get(resource, { params });
  },

  // POST request
  post(resource, data, config = {}) {
    return apiClient.post(resource, data, config);
  },

  // PUT request
  put(resource, data) {
    return apiClient.put(resource, data);
  },

  // PATCH request
  patch(resource, data) {
    return apiClient.patch(resource, data);
  },

  // DELETE request
  delete(resource) {
    return apiClient.delete(resource);
  },

  // Set authentication token
  setAuthToken(token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Clear authentication token
  clearAuthToken() {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
