// src/services/auth.ts
import api from './api';
import { LoginCredentials, RegisterData, User, ApiResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      data
    );
    return response.data.data!;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  setAuthData(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};