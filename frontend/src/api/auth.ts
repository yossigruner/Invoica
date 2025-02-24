import api from './axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Sending login request...');
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login response received:', {
        status: response.status,
        hasToken: !!response.data?.access_token,
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // First create the user
      console.log('📝 Creating new user...');
      const createResponse = await api.post('/users', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      console.log('✅ User created successfully:', createResponse.data);
      
      // Then login with the created credentials
      console.log('🔐 Logging in new user...');
      const loginResponse = await this.login({
        email: data.email,
        password: data.password,
      });

      return loginResponse;
    } catch (error: any) {
      console.error('❌ Registration error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('🔒 Removing auth token from storage...');
      const token = this.getAuthToken();
      console.log('Current token exists:', !!token);
      
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      console.log('Token removed, checking storage:', {
        tokenInStorage: !!localStorage.getItem('token'),
        tokenInHeaders: !!api.defaults.headers.common['Authorization']
      });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      throw error;
    }
  },

  async getProfile(): Promise<any> {
    try {
      console.log('👤 Fetching user profile...');
      console.log('Current auth header:', api.defaults.headers.common['Authorization']);
      const response = await api.get('/auth/profile');
      console.log('✅ Profile fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get profile error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  setAuthToken(token: string): void {
    try {
      console.log('💾 Setting auth token...');
      if (!token) {
        console.warn('⚠️ Attempted to set empty token');
        return;
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Token set successfully:', {
        tokenInStorage: !!localStorage.getItem('token'),
        tokenInHeaders: !!api.defaults.headers.common['Authorization'],
        headerValue: api.defaults.headers.common['Authorization']
      });
    } catch (error) {
      console.error('❌ Error setting auth token:', error);
      throw error;
    }
  },

  getAuthToken(): string | null {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Getting auth token:', {
        exists: !!token,
        headerExists: !!api.defaults.headers.common['Authorization']
      });
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    const isAuth = !!this.getAuthToken();
    console.log('🔒 Checking authentication:', {
      isAuthenticated: isAuth,
      hasAuthHeader: !!api.defaults.headers.common['Authorization']
    });
    return isAuth;
  }
}; 