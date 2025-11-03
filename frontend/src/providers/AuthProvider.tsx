import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authApi } from '../api/services/api';
import type { User, LoginForm, RegisterForm, OTPForm, OTPResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  sendOtp: (email: string) => Promise<OTPResponse>;
  verifyOtp: (otpData: OTPForm) => Promise<OTPResponse>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  const { data: userData, isLoading: isUserLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getCurrentUser,
    enabled: !!localStorage.getItem('auth_token') && !isInitialized,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.access_token);
      setUser(data.user);
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      const message = errorData?.error || 'Login failed';
      
      // Check if user doesn't exist
      if (errorData?.error_code === 'USER_NOT_FOUND') {
        toast.error('Account not found. Redirecting to signup...');
        // Add a flag to indicate redirect to signup
        error.redirectToSignup = true;
      } else {
        toast.error(message);
      }
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.access_token);
      setUser(data.user);
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Success toast is handled in the component for better UX
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      const message = errorData?.error || 'Registration failed';
      
      // Log the error for debugging
      console.error('Registration error:', errorData);
      
      // Don't show toast here as it's handled in the component
      // This allows for more specific error handling
      throw error;
    },
  });

  // Initialize user state
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (error) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setUser(null);
    }
    setIsInitialized(true);
  }, [userData, error]);

  const login = async (credentials: LoginForm): Promise<void> => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: RegisterForm): Promise<void> => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    setUser(null);
    queryClient.clear();
    queryClient.setQueryData(['auth', 'user'], null);
    toast.info('Logged out successfully');
  };

  const refreshUser = (): void => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
  };

  const sendOtp = async (email: string): Promise<OTPResponse> => {
    try {
      const response = await authApi.sendOtp(email);
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send OTP';
      console.error('Send OTP error:', error.response?.data);
      throw error;
    }
  };

  const verifyOtp = async (otpData: OTPForm): Promise<OTPResponse> => {
    try {
      const response = await authApi.verifyOtp(otpData);
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'OTP verification failed';
      console.error('Verify OTP error:', error.response?.data);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: !!user,
    isLoading: !isInitialized || isUserLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    sendOtp,
    verifyOtp,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};