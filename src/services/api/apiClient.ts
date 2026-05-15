// services/api/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If data is FormData, ensure headers are correct for React Native
  // Check for FormData instance or if data has FormData-like structure (React Native FormData)
  const isFormData = config.data instanceof FormData ||
    (config.data && typeof config.data === 'object' && config.data._parts);

  if (isFormData) {
    // Remove Content-Type header completely - React Native will set it automatically with boundary
    delete config.headers['Content-Type'];
    // Don't set Accept header - let it default
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token if we have a refresh token stored
      const authState = useAuthStore.getState();
      const refreshToken = authState.refreshToken;
      
      if (refreshToken) {
        try {
          // Import refreshToken function dynamically to avoid circular dependency
          const { refreshToken: refreshTokenApi } = await import('./authService');
          const response = await refreshTokenApi(refreshToken);
          
          // Handle different response structures
          // API might return { data: { token, refreshToken } } or { token, refreshToken } directly
          const newToken = response.data?.token || response.token;
          const newRefreshToken = response.data?.refreshToken || response.refreshToken;
          
          if (newToken) {
            // Update token and refreshToken in store
            if (authState.user) {
              authState.setToken(newToken, newRefreshToken);
            } else {
              // If user is missing, logout (shouldn't happen but safety check)
              authState.logout();
              return Promise.reject(new Error('User data missing during token refresh'));
            }
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } else {
            throw new Error('Token not found in refresh response');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Refresh failed, logout user
          authState.logout();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        authState.logout();
      }
    }

    const normalizedError = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  },
);

