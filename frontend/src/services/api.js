import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Too many requests');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`HTTP Error ${status}:`, data?.message || error.message);
      }
      
      // Return a more user-friendly error object
      return Promise.reject({
        status,
        message: data?.error || data?.message || error.message,
        originalError: error
      });
    }
    
    if (error.request) {
      // Network error
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your internet connection.',
        originalError: error
      });
    }
    
    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      originalError: error
    });
  }
);

export default api;
