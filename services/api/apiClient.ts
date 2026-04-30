import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
    }
    if (!token) {
      try {
        token = await SecureStore.getItemAsync('token');
      } catch (e) {
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;
      if (refreshToken) {
        try {
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('token', newToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    console.warn('Error 401: Token expirado o inválido');
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;