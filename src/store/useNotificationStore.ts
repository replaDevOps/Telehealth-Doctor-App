import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllNotifications,
  deleteNotification,
  clearAllNotifications,
  Notification,
} from '../services/api/notificationService';
import { useAuthStore } from './useAuthStore';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  lastFetched: number | null;
  /** Ids the user has already seen. Persisted so the badge stays cleared across refetches. */
  readIds: number[];
  /** Storage key the current readIds were loaded from; null when not loaded yet. */
  readIdsKey: string | null;
  fetchNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

// Keep the persisted list bounded; older ids belong to notifications long gone.
const MAX_READ_IDS = 500;

const READ_IDS_KEY_PREFIX = 'notifications:read-ids:';

/** Read state is per account, so signing in as someone else starts clean. */
const readIdsStorageKey = (): string =>
  `${READ_IDS_KEY_PREFIX}${useAuthStore.getState().user?.id ?? 'anonymous'}`;

export const useNotificationStore = create<NotificationStore>((set, get) => {
  /** Loads (and caches) the persisted read ids for the signed-in user. */
  const loadReadIds = async (): Promise<number[]> => {
    const key = readIdsStorageKey();
    if (get().readIdsKey === key) {
      return get().readIds;
    }

    let ids: number[] = [];
    try {
      const raw = await AsyncStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        ids = parsed.map(Number).filter(id => Number.isFinite(id));
      }
    } catch (error: any) {
      console.error('Failed to load read notification ids:', error);
    }

    set({ readIds: ids, readIdsKey: key });
    return ids;
  };

  const persistReadIds = async (ids: number[]) => {
    try {
      await AsyncStorage.setItem(readIdsStorageKey(), JSON.stringify(ids));
    } catch (error: any) {
      console.error('Failed to persist read notification ids:', error);
    }
  };

  return {
    notifications: [],
    isLoading: false,
    unreadCount: 0,
    lastFetched: null,
    readIds: [],
    readIdsKey: null,

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
        const [response, readIds] = await Promise.all([
          getAllNotifications(),
          loadReadIds(),
        ]);

        // Handle API response structure: { success: true, data: [...] }
        // response is { success: true, data: [...] }
        // So response.data is the array of notifications
        const notificationsList = Array.isArray(response.data)
          ? response.data
          : (Array.isArray(response.notifications) ? response.notifications : []);

        const readIdSet = new Set(readIds.map(String));

        // Map API response to notification format
        // API structure: { id, type, description, dateTime }
        const mappedNotifications: Notification[] = notificationsList.map((item: any) => {
          // The API does not track read state, so fall back to what the user has
          // already opened locally. Unknown ids are treated as unread.
          const isRead =
            item.read === true ||
            item.is_read === true ||
            readIdSet.has(String(item.id));

          return {
            id: item.id,
            title: item.type || item.title || 'Notification',
            message: item.description || item.message || item.body || item.content || '',
            description: item.description,
            type: item.type,
            dateTime: item.dateTime,
            created_at: item.dateTime || item.created_at || item.time || item.date,
            updated_at: item.updated_at,
            time: item.dateTime || item.created_at || item.time || item.date,
            // Keep all original fields for backward compatibility
            ...item,
            read: isRead,
            is_read: isRead,
          };
        });

        const unreadCount = mappedNotifications.filter(
          (notif: Notification) => !notif.read,
        ).length;

        set({
          notifications: mappedNotifications,
          unreadCount,
          isLoading: false,
          lastFetched: Date.now(),
        });
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        set({ isLoading: false });
      }
    },

    /**
     * Marks every loaded notification as read and clears the badge. Called when the
     * user opens the notification panel.
     */
    markAllAsRead: async () => {
      const { notifications, unreadCount } = get();
      if (notifications.length === 0 || unreadCount === 0) {
        return;
      }

      const existingReadIds = await loadReadIds();
      const seenIds = notifications
        .map(notif => Number(notif.id))
        .filter(id => Number.isFinite(id));

      const mergedReadIds = Array.from(
        new Set([...existingReadIds, ...seenIds]),
      ).slice(-MAX_READ_IDS);

      // Clear the badge straight away; persistence follows.
      set({
        notifications: notifications.map(notif => ({
          ...notif,
          read: true,
          is_read: true,
        })),
        unreadCount: 0,
        readIds: mergedReadIds,
      });

      await persistReadIds(mergedReadIds);
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

        // Drop the deleted id so the persisted list does not grow forever
        const updatedReadIds = get().readIds.filter(readId => readId !== Number(id));

        set({
          notifications: updatedNotifications,
          unreadCount,
          readIds: updatedReadIds,
        });

        await persistReadIds(updatedReadIds);
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
          readIds: [],
        });

        await persistReadIds([]);
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
  };
});
