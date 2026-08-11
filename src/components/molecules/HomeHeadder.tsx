import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import LinearGradient from 'react-native-linear-gradient';
import { mvs } from '@config/metrices';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '@components/common/Avatar';
import { useTranslation } from 'react-i18next';

interface HomeHeaderProps {
  centerName?: string;
  location?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorImage?: any;
  isActive?: boolean;
  isStatusLoading?: boolean;
  onToggleActive?: (value: boolean) => void;
  onNotificationPress?: () => void;
  onLocationPress?: () => void;
  notificationCount?: number;
}

const HomeHeader = ({
  centerName = 'Eden Medical Center',
  location = 'Makkah',
  doctorName = 'Sultan Khan',
  doctorSpecialty = 'Dermatologist',
  doctorImage,
  isActive = true,
  isStatusLoading = false,
  onToggleActive,
  onNotificationPress,
  onLocationPress,
  notificationCount = 0,
}: HomeHeaderProps) => {
  const { t } = useTranslation();
  const inset = useSafeAreaInsets()
  return (
    <LinearGradient
      colors={['#7625D7', '#591CA2', '#3E1371']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.linearGradientContainer}
    >
      <View style={[styles.headerContainer, { paddingTop: inset.top+20 }]}>
        {/* Top Section - Medical Center Name & Notification */}
        <View style={styles.topRow}>
          <View style={styles.centerInfoContainer}>
            <Text style={styles.centerName}>{centerName}</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={14} color={colors.white} />
              <Text style={styles.locationText}>{location}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <View style={styles.notificationIconContainer}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.black}
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Section - Doctor Info & Toggle */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorInfoContainer}>
            {/* Doctor Avatar */}
            <View style={styles.avatarContainer}>
              <Avatar
                name={doctorName}
                source={doctorImage}
                size={48}
                style={styles.avatar}
                backgroundColor={colors.white}
                textColor="#7625D7"
                fontSize={20}
              />
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: colors.white,
                      fontSize: 10,
                      fontWeight: '600',
                    }}
                  >
                    {t('home.active')}
                  </Text>
                </View>
              )}
            </View>

            {/* Doctor Details */}
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{doctorName}</Text>
              {/* <Text style={styles.doctorSpecialty}>{doctorSpecialty}</Text> */}
            </View>
          </View>

          {/* Active Toggle */}
          {isStatusLoading ? (
            <View style={styles.switchLoaderContainer}>
              <ActivityIndicator size="small" color={colors.white} />
            </View>
          ) : (
            <Switch
              value={isActive}
              onValueChange={onToggleActive}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor={colors.white}
              ios_backgroundColor="#D1D1D6"
              style={styles.switch}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradientContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  centerInfoContainer: {
    flex: 1,
  },
  centerName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.9,
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  doctorCard: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    width: mvs(50),
    height: 15,
    backgroundColor: '#34C759',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorSpecialty: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  switchLoaderContainer: {
    width: 51,
    height: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
