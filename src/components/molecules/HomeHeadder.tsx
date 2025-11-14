import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import LinearGradient from 'react-native-linear-gradient';
import { mvs } from '@config/metrices';

interface HomeHeaderProps {
  centerName?: string;
  location?: string;
  patientName?: string;
  patientSpecialty?: string;
  patientImage?: any;
  isActive?: boolean;
  onToggleActive?: (value: boolean) => void;
  onNotificationPress?: () => void;
  onLocationPress?: () => void;
}

const HomeHeader = ({
  centerName = 'Eden Medical Center',
  location = 'Makkah',
  patientName = 'Dr. Sultan Khan',
  patientSpecialty = 'Dermatologist',
  patientImage,
  isActive = true,
  onToggleActive,
  onNotificationPress,
  onLocationPress,
}: HomeHeaderProps) => {
  return (
    <LinearGradient
      colors={['#7625D7', '#591CA2', '#3E1371']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.linearGradientContainer}
    >
      <View style={styles.headerContainer}>
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
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Section - Doctor Info & Toggle */}
        <View style={styles.patientCard}>
          <View style={styles.patientInfoContainer}>
            {/* Doctor Avatar */}
            <View style={styles.avatarContainer}>
              {patientImage ? (
                <Image source={patientImage} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {patientName?.charAt(3) || 'D'}
                  </Text>
                </View>
              )}
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
                    Active
                  </Text>
                </View>
              )}
            </View>

            {/* Doctor Details */}
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>{patientName}</Text>
              <Text style={styles.patientSpecialty}>{patientSpecialty}</Text>
            </View>
          </View>

          {/* Active Toggle */}
          <Switch
            value={isActive}
            onValueChange={onToggleActive}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={colors.white}
            ios_backgroundColor="#D1D1D6"
            style={styles.switch}
          />
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
    paddingTop: 70,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  patientCard: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfoContainer: {
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
  avatarPlaceholder: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7625D7',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    left: 0,
    zIndex: 1,
    width: mvs(50),
    height: 15,
    backgroundColor: '#34C759',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  patientSpecialty: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

export default HomeHeader;
