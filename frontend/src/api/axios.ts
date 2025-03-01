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
    
    // Log the request details
    console.log('🚀 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      hasToken: !!token,
      authHeader: config.headers.Authorization,
    });
    
    // Set auth token if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added token to request:', {
        tokenExists: true,
        headerSet: !!config.headers.Authorization
      });
    } else {
      console.log('⚠️ No token found for request');
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
    // Log the response details
    console.log('✅ Response:', {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data,
      authHeader: response.config.headers.Authorization,
    });
    return response;
  },
  async (error) => {
    // Log the error response details
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      authHeader: error.config?.headers?.Authorization,
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔒 Authentication error detected, clearing token...');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api; 