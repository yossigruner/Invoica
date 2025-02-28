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

export interface ResetPasswordResponse {
  message: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('User not found. Please register first.');
      }
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // First create the user
      const createResponse = await api.post('/users', {
        email: data.email,
        password: data.password,
      });

      // Then login with the created credentials
      const loginResponse = await this.login({
        email: data.email,
        password: data.password,
      });

      return loginResponse;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('Email already exists. Please use a different email.');
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  async getProfile(): Promise<any> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
      }
      throw error;
    }
  },

  setAuthToken(token: string): void {
    if (!token) {
      return;
    }
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  },

  async resetPassword(email: string): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('User not found with this email.');
      }
      throw error;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}; 