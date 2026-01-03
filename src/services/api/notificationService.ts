import { apiClient } from './apiClient';
import { API } from './endpoints';

export interface Notification {
  id: number;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface NotificationsResponse {
  success?: boolean;
  status?: boolean;
  data?: Notification[];
  message?: string;
}

export interface DeleteNotificationResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
}

/**
 * Get all notifications for the doctor
 * @returns Promise with list of notifications
 */
export const getAllNotifications = async (): Promise<NotificationsResponse> => {
  try {
    const response = await apiClient.get<NotificationsResponse>(
      API.NOTIFICATIONS.VIEW_ALL,
    );
    console.log('Get All Notifications:', response.data);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data || response;
    
    return responseData;
  } catch (error: any) {
    console.error('Get All Notifications Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch notifications';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a specific notification by ID
 * @param notificationId - The ID of the notification to delete
 * @returns Promise with delete response
 */
export const deleteNotification = async (
  notificationId: number,
): Promise<DeleteNotificationResponse> => {
  try {
    const response = await apiClient.delete<DeleteNotificationResponse>(
      `${API.NOTIFICATIONS.DELETE}/${notificationId}`,
    );
    console.log('Delete Notification:', response.data);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data || response;
    
    return responseData;
  } catch (error: any) {
    console.error('Delete Notification Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete notification';
    throw new Error(errorMessage);
  }
};

/**
 * Clear all notifications
 * @returns Promise with clear all response
 */
export const clearAllNotifications = async (): Promise<DeleteNotificationResponse> => {
  try {
    const response = await apiClient.delete<DeleteNotificationResponse>(
      API.NOTIFICATIONS.CLEAR_ALL,
    );
    console.log('Clear All Notifications:', response.data);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data || response;
    
    return responseData;
  } catch (error: any) {
    console.error('Clear All Notifications Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to clear all notifications';
    throw new Error(errorMessage);
  }
};

