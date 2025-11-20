import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Header2 } from '@components/common/Header2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useTranslation } from 'react-i18next';

export const NotificationScreen = () => {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Appointment Confirmed',
      message:
        'Your appointment for Botox Injection with Dr. Sara Khan at Al Jour Clinic on 22 Nov 2025 at 10:30 AM has been confirmed.',
      time: '15 Nov 2025 - 09:12 AM',
      unread: true,
    },
    {
      id: 2,
      title: 'Loyalty Points Earned',
      message:
        'You earned 50 points for completing your appointment for Facial Rejuvenation at SkinCare Plus.',
      time: '15 Nov 2025 - 09:12 AM',
      unread: true,
    },
    {
      id: 3,
      title: 'Points Redeemed',
      message:
        'Your appointment for Botox Injection with Dr. Sara Khan at Al Jour Clinic on 22 Nov 2025 at 10:30 AM has been confirmed.',
      time: '15 Nov 2025 - 09:12 AM',
      unread: true,
    },
    {
      id: 4,
      title: 'Refund Processed',
      message:
        'Your appointment for Botox Injection with Dr. Sara Khan at Al Jour Clinic on 22 Nov 2025 at 10:30 AM has been confirmed.',
      time: '15 Nov 2025 - 09:12 AM',
      unread: false,
    },
    {
      id: 5,
      title: 'Update',
      message: 'Your profile has been updated successfully',
      time: '15 Nov 2025 - 09:12 AM',
      unread: false,
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - already translated */}
      <Header2 title={t('notifications')} />

      {notifications.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                index !== notifications.length - 1 && styles.notificationBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name="bell-outline" size={20} color={colors.borderDark} />
              </View>

              <View style={styles.contentContainer}>
                {/* Dynamic title & message come from backend → not translated here */}
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>{notification.time}</Text>
              </View>

              {notification.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* Empty State - fully translated */
        <View style={styles.emptyState}>
          <Icon name="bell-off-outline" size={55} color={colors.black} />
          <Text style={styles.emptyTitle}>{t('no_notifications_yet')}</Text>
          <Text style={styles.emptyMessage}>
            {t('no_notifications_message')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
