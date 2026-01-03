import { create } from 'zustand';
import {
  getAllNotifications,
  deleteNotification,
  clearAllNotifications,
  Notification,
} from '../services/api/notificationService';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  lastFetched: number | null;
  fetchNotifications: () => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  unreadCount: 0,
  lastFetched: null,

  fetchNotifications: async () => {
    const state = get();

    // Check if we have cached data that's still valid
    if (state.notifications.length > 0 && state.lastFetched) {
      const now = Date.now();
      if (now - state.lastFetched < CACHE_DURATION) {
        // Use cached data
        return;
      }
    }

    // Fetch new data
    set({ isLoading: true });

    try {
      const response = await getAllNotifications();
      
      // Handle different response structures
      const notificationsList = response.data || response.notifications || [];
      
      // Calculate unread count
      const unreadCount = notificationsList.filter(
        (notif: Notification) => !notif.read,
      ).length;

      set({
        notifications: notificationsList,
        unreadCount,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  removeNotification: async (id: number) => {
    try {
      await deleteNotification(id);
      
      // Remove from local state
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.filter(
        (notif) => notif.id !== id,
      );
      
      // Recalculate unread count
      const unreadCount = updatedNotifications.filter(
        (notif) => !notif.read,
      ).length;

      set({
        notifications: updatedNotifications,
        unreadCount,
      });
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  clearAll: async () => {
    try {
      await clearAllNotifications();
      
      set({
        notifications: [],
        unreadCount: 0,
        lastFetched: null,
      });
    } catch (error: any) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  },

  refreshNotifications: async () => {
    // Force refresh by clearing cache
    set({ lastFetched: null });
    await get().fetchNotifications();
  },
}));

