// src/services/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  _tokenUsed?: string;
};

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

const apiBaseUrl = rawApiUrl
  ? rawApiUrl.replace(/\/$/, '').endsWith('/api')
    ? rawApiUrl.replace(/\/$/, '')
    : `${rawApiUrl.replace(/\/$/, '')}/api`
  : '/api';

const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    (config as AuthenticatedRequestConfig)._tokenUsed = token ?? undefined;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED') {
      return Promise.reject(error);
    }

    const currentToken = localStorage.getItem('token');
    const requestToken = (error.config as AuthenticatedRequestConfig | undefined)?._tokenUsed;
    const isActiveSessionRequest = Boolean(currentToken) && requestToken === currentToken;

    if (error.response?.status === 401 && isActiveSessionRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    
    const message = (error.response?.data as any)?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;