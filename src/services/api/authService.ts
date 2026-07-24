// services/api/authService.ts
import { apiClient } from './apiClient';
import { API } from './endpoints';

export interface LoginRequest {
  phoneNo: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phoneNo?: string;
    type: string;
    token: string;
    refreshToken?: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    token: string;
    refreshToken?: string;
  };
  token?: string;
  refreshToken?: string;
}

export interface LogoutResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: {
    status?: boolean;
    message?: string;
  };
}

/**
 * Login with phone number and password
 * @param credentials - Login credentials containing phoneNo and password
 * @returns Promise with login response containing user data and token
 */
export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<{ data: LoginResponse }>(
      API.AUTH.LOGIN,
      credentials,
    );
    
    console.log('Login API response:', response);
    
    // API returns { data: { status, message, user: {...} } }
    const responseData = response.data?.data || response.data;
    
    // If the API returns status: false, throw an error
    if (responseData.status === false) {
      throw new Error(
        responseData.message || 'Login failed. Please try again.',
      );
    }
    
    // Return the data structure
    return responseData;
  } catch (error: any) {
    console.error('Login API error:', error);
    // If error has a response with data, use that message
    const errorMessage = 
      error?.response?.data?.data?.message ||
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Refresh access token using refresh token
 * @param refreshToken - The refresh token string
 * @returns Promise with new access token and refresh token
 */
export const refreshToken = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  try {
    const response = await apiClient.post<{ data: RefreshTokenResponse } | RefreshTokenResponse>(
      API.AUTH.REFRESH_TOKEN,
      {
        refresh_token: refreshToken,
      },
    );
    
    // Handle different response structures
    // API might return { data: { token, refreshToken } } or { token, refreshToken } directly
    const responseData = response.data?.data || response.data || response;
    
    // Check if response indicates failure
    if (responseData.status === false || responseData.success === false) {
      throw new Error(
        responseData.message || 'Token refresh failed. Please login again.',
      );
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Refresh token API error:', error);
    const errorMessage = 
      error?.response?.data?.data?.message ||
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Token refresh failed. Please login again.';
    throw new Error(errorMessage);
  }
};

/**
 * Logout the current user
 * @returns Promise with logout response
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await apiClient.get<{ data: LogoutResponse } | LogoutResponse>(API.AUTH.LOGOUT);
    
    console.log('Logout API response:', response);
    
    // Handle different response structures
    // API might return { data: { status, message } } or { status, message } directly
    const responseData = response.data?.data || response.data || response;
    
    return responseData;
  } catch (error: any) {
    console.error('Logout API error:', error);
    // Even if API call fails, we should still allow logout
    // So we don't throw an error, just log it
    const errorMessage = 
      error?.response?.data?.data?.message ||
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      'Logout API call failed, but proceeding with logout';
    console.log(errorMessage);
    // Return a success response even if API fails
    return { status: true, message: 'Logged out' };
  }
};

