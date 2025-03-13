import axios from 'axios';

// Create the main API instance with auth
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Create a public API instance without auth
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        hasToken: !!token,
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (isDevelopment) {
        console.log('🔑 Added token to request');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', {
        status: response.status,
        url: response.config.url,
        hasData: !!response.data,
      });
    }
    return response;
  },
  async (error) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Only log detailed error info in development
    if (isDevelopment) {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      if (isDevelopment) {
        console.log('🔒 Authentication error detected, clearing token...');
      }
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api; 