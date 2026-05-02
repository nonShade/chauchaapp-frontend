import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    try {
      token = await AsyncStorage.getItem('token');
    } catch (e) {
      // fallback to SecureStore if AsyncStorage fails
      try {
        token = await SecureStore.getItemAsync('token');
      } catch (err) {
        // ignore
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
      let refreshToken: string | null = null;
      try {
        refreshToken = await AsyncStorage.getItem('refresh_token');
      } catch (e) {
        try {
          refreshToken = await SecureStore.getItemAsync('refresh_token');
        } catch (err) {
          refreshToken = null;
        }
      }
      if (refreshToken) {
        try {
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          try {
            await AsyncStorage.setItem('token', newToken);
          } catch (e) {
            // ignore
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user');
          } catch (e) {
            // ignore
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