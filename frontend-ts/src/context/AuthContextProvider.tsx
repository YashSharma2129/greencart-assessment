import React, { useState, useEffect } from 'react';
import type { AuthContextType, User } from '../types';
import { authApi } from '../services/authApi';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      authApi
        .getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    
    if (result.success && result.data) {
      const { token, ...userData } = result.data as { token: string } & User;
      localStorage.setItem('token', token);
      setUser(userData);
    }
    
    return result;
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'driver' = 'driver') => {
    const result = await authApi.register({ name, email, password, role });
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user || !!localStorage.getItem('token'),
    getToken: () => localStorage.getItem('token'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
