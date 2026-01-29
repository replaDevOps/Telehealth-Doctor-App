import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Header2 } from '@components/common/Header2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { colors } from '../../../styles/colors';
import { useNotificationStore } from '../../../store';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from 'toastify-react-native';
import { useTranslation } from 'react-i18next';

interface NotificationItem {
  id: number | string;
  title?: string;
  message?: string;
  time?: string;
  created_at?: string;
  read?: boolean;
  is_read?: boolean;
}

export const NotificationScreen = () => {
  const { t } = useTranslation();
  const { notifications, isLoading, fetchNotifications, removeNotification, clearAll } = useNotificationStore();
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Fetch notifications on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  // Delete single notification
  const handleDeleteNotification = async (id: number | string) => {
    try {
      setDeletingId(id);
      await removeNotification(Number(id));
      Toast.success('Notification deleted');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete notification';
      Toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearingAll(true);
              await clearAll();
              Toast.success('All notifications cleared');
            } catch (error: any) {
              console.error('Error clearing notifications:', error);
              const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to clear notifications';
              Toast.error(errorMessage);
            } finally {
              setClearingAll(false);
            }
          },
        },
      ]
    );
  };

  // Format time
  const formatTime = (timeStr?: string): string => {
    if (!timeStr) return '';

    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      // Format as date if older than a week
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch (e) {
      return timeStr;
    }
  };

  // Map notifications to display format
  const mappedNotifications: NotificationItem[] = notifications.map((item: any) => ({
    id: item.id,
    title: item.title || item.type || 'Notification',
    message: item.message || item.description || item.body || item.content || '',
    time: item.dateTime || item.created_at || item.time || item.date || '',
    read: item.read !== false && item.is_read !== false,
    is_read: item.read !== false && item.is_read !== false,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Header2 title={t('settings.notifications')} back />

      {mappedNotifications.length > 0 && (
        <View style={styles.clearAllContainer}>
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
            disabled={clearingAll}
          >
            {clearingAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Icon name="delete-sweep" size={18} color={colors.primary} />
                <Text style={styles.clearAllText}>Clear All</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : mappedNotifications.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {mappedNotifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                index !== mappedNotifications.length - 1 && styles.notificationBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name="bell-outline"
                  size={20}
                  color={!notification.read ? colors.primary : colors.secondaryText}
                />
              </View>

              <View style={styles.contentContainer}>
                <Text style={[
                  styles.title,
                  !notification.read && styles.titleUnread
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>
                  {formatTime(notification.time || notification.created_at)}
                </Text>
              </View>

              <View style={styles.rightActions}>
                {!notification.read && <View style={styles.unreadDot} />}
                <TouchableOpacity
                  onPress={() => handleDeleteNotification(notification.id)}
                  disabled={deletingId === notification.id}
                  style={{ padding: 8, marginLeft: 8 }}
                >
                  {deletingId === notification.id ? (
                    <ActivityIndicator size="small" color={colors.secondaryText} />
                  ) : (
                    <Icon name="delete-outline" size={20} color={colors.secondaryText} />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="bell-off-outline" size={64} color={colors.secondaryText} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>
            You don't have any notifications yet. When you receive notifications, they will appear here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

