import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi, LoginCredentials, RegisterData, AuthResponse, ResetPasswordResponse } from '@/api/auth';
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
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse | undefined>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/about', '/contact', '/faq'];
const PUBLIC_ROUTE_PREFIXES = ['/pay/', '/invoices/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = (path: string) => {
    if (PUBLIC_ROUTES.includes(path)) return true;
    return PUBLIC_ROUTE_PREFIXES.some(prefix => path.startsWith(prefix));
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isPublicRoute(location.pathname)) {
          setLoading(false);
          return;
        }

        if (authApi.isAuthenticated()) {
          const profile = await authApi.getProfile();
          setUser(profile);
        } else {
          if (!isPublicRoute(location.pathname)) {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (credentials: { email: string; password: string }) => {
    let response;
    try {
      response = await authApi.login(credentials);
      
      console.log('response', response);

      if (!response?.access_token) {
        throw new Error('Invalid login response - no access token');
      }

      authApi.setAuthToken(response.access_token);
      const profile = await authApi.getProfile();
      setUser(profile);
      
      // Only navigate and show success toast if login was successful
      navigate('/', { replace: true });
      toast.success('Login successful');
      return response; // Return the response for the component to handle
    } catch (error) {
      // Don't show the toast for expected errors like "User not found"
      if (!(error instanceof Error && error.message.includes('User not found'))) {
        toast.error('Login failed. Please check your credentials.');
      }
      throw error; // Re-throw the error so the Login component can handle it
    } finally {
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      
      if (!response.access_token) {
        throw new Error('Invalid registration response');
      }

      authApi.setAuthToken(response.access_token);
      const profile = await authApi.getProfile();
      setUser(profile);
      
      navigate('/', { replace: true });
      toast.success('Registration successful');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        toast.error('Email already exists. Please use a different email.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    } finally {
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authApi.resetPassword(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      if (error instanceof Error && error.message.includes('User not found')) {
        toast.error('No account found with this email address');
      } else {
        toast.error('Failed to send password reset instructions. Please try again.');
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
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