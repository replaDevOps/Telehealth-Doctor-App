// services/api/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store';
import { API } from './endpoints';
import { handleUnauthenticated } from './sessionManager';

// Endpoints a 401 must never trigger a token refresh for: login (401 just means
// bad credentials), refreshToken (retrying it would recurse until the stack
// gives out) and logout (the session is being torn down anyway).
const AUTH_ENDPOINTS = [
  API.AUTH.LOGIN,
  API.AUTH.REFRESH_TOKEN,
  API.AUTH.LOGOUT,
];

const isAuthEndpoint = (url?: string) =>
  !!url && AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));

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
    if (error.response?.status === 401) {
      const authState = useAuthStore.getState();
      const refreshToken = authState.refreshToken;

      // One refresh attempt per request, tracked by _retry. A missing user or
      // refresh token means there is nothing to refresh with.
      const canAttemptRefresh =
        !isAuthEndpoint(originalRequest?.url) &&
        !originalRequest._retry &&
        !!refreshToken &&
        !!authState.user;

      if (canAttemptRefresh) {
        originalRequest._retry = true;

        try {
          // Import refreshToken function dynamically to avoid circular dependency
          const { refreshToken: refreshTokenApi } = await import('./authService');
          const response = await refreshTokenApi(refreshToken);

          // Handle different response structures
          // API might return { data: { token, refreshToken } } or { token, refreshToken } directly
          const newToken = response.data?.token || response.token;
          const newRefreshToken = response.data?.refreshToken || response.refreshToken;

          if (!newToken) {
            throw new Error('Token not found in refresh response');
          }

          authState.setToken(newToken, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Refresh failed, the session is unrecoverable
          handleUnauthenticated();
          return Promise.reject(refreshError);
        }
      }

      // Either there was nothing to refresh with, or the already-retried
      // request came back 401 again: the session is genuinely dead.
      handleUnauthenticated();
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

