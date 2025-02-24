import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginCredentials, RegisterData } from '@/api/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      if (authApi.isAuthenticated()) {
        console.log('🎫 Token found, fetching user profile...');
        const profile = await authApi.getProfile();
        console.log('👤 Profile data:', profile);
        setUser(profile);
      } else {
        console.log('🚫 No authentication token found');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
      console.log('✅ Auth check completed');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Starting login process...');
      setLoading(true);
      const response = await authApi.login(credentials);
      console.log('🎫 Login response:', response);
      
      if (!response.access_token) {
        console.error('❌ Invalid login response - no access token');
        throw new Error('Invalid login response');
      }

      console.log('💾 Setting auth token...');
      authApi.setAuthToken(response.access_token);
      
      console.log('👤 Fetching user profile...');
      const profile = await authApi.getProfile();
      console.log('✅ Profile fetched:', profile);
      setUser(profile);
      
      toast.success('Login successful');
      
      console.log('🔄 Navigating to home page...');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('❌ Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
      console.log('🔄 Login process completed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('📝 Starting registration process...');
      setLoading(true);
      const response = await authApi.register(data);
      console.log('🎫 Registration response:', response);
      
      if (!response.access_token) {
        console.error('❌ Invalid registration response - no access token');
        throw new Error('Invalid registration response');
      }

      console.log('💾 Setting auth token...');
      authApi.setAuthToken(response.access_token);
      
      console.log('👤 Fetching user profile...');
      const profile = await authApi.getProfile();
      console.log('✅ Profile fetched:', profile);
      setUser(profile);
      
      toast.success('Registration successful');
      
      console.log('🔄 Navigating to home page...');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
      console.log('🔄 Registration process completed');
    }
  };

  const logout = async () => {
    try {
      console.log('🔒 Starting logout process...');
      await authApi.logout();
      setUser(null);
      console.log('🔄 Navigating to login page...');
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 