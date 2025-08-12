import api from './api';
import type { AuthResult, LoginFormData, RegisterFormData, User } from '../types';
import type { AxiosError } from 'axios';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<AuthResult> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Login failed'
      };
    }
  },

  register: async (userData: Omit<RegisterFormData, 'confirmPassword'>): Promise<AuthResult> => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Registration failed'
      };
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};
