import React, { useEffect, useState } from 'react';
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

/**
 * NOTE: every child below lives inside <LinearGradient>, which is
 * react-native-linear-gradient's `requireNativeComponent('BVLinearGradient')` — a legacy
 * view manager with no codegenConfig. Under the new architecture it mounts through
 * RCTLegacyViewManagerInteropComponentView, whose finalizeUpdates: applies ALL child
 * inserts before ALL removes. Fabric computes those indices expecting them to interleave,
 * so a single commit that both adds and removes a child here can insert past the end of
 * the subview array and raise NSRangeException — an immediate native crash, not a warning.
 *
 * Toggling Active did exactly that (badge in, spinner out, in one commit). So nothing in
 * this subtree is conditionally mounted: children are always rendered and hidden with
 * `styles.hidden`. Keep it that way when editing this component.
 */
const AVATAR_SIZE = 48;
const SWITCH_WIDTH = 51;
const SWITCH_HEIGHT = 31;

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

  // iOS moves its native switch as soon as the finger lifts. If we only feed it
  // `isActive` — which the parent updates after the API call — the native thumb and
  // React state drift apart, and a value that ends up back where it started sends no
  // prop update at all, leaving the switch stuck in the wrong position. Mirroring the
  // prop in local state means every outcome (confirm or revert) is a real state change
  // that gets pushed down to the native switch.
  const [switchValue, setSwitchValue] = useState(isActive);

  useEffect(() => {
    setSwitchValue(isActive);
  }, [isActive]);

  const handleToggle = (value: boolean) => {
    setSwitchValue(value);
    onToggleActive?.(value);
  };

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
            <Text style={styles.centerName} numberOfLines={2}>
              {centerName}
            </Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location"
                size={14}
                color={colors.white}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText} numberOfLines={2}>
                {location}
              </Text>
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
              {/* Always mounted, hidden with opacity — see NOTE at the top of the file. */}
              <View
                style={[
                  styles.notificationBadge,
                  notificationCount === 0 && styles.hidden,
                ]}
              >
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
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
                size={AVATAR_SIZE}
                style={styles.avatar}
                backgroundColor={colors.white}
                textColor="#7625D7"
                fontSize={20}
              />
              <View
                style={[styles.activeIndicator, !isActive && styles.hidden]}
                pointerEvents="none"
              >
                <Text style={styles.activeIndicatorText}>{t('home.active')}</Text>
              </View>
            </View>

            {/* Doctor Details */}
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{doctorName}</Text>
              {/* <Text style={styles.doctorSpecialty}>{doctorSpecialty}</Text> */}
            </View>
          </View>

          {/* Active Toggle. The switch stays mounted while the request is in flight —
              swapping it for a spinner reset the native control and shifted the row. */}
          <View style={styles.switchContainer}>
            <Switch
              value={switchValue}
              onValueChange={handleToggle}
              disabled={isStatusLoading}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor={colors.white}
              ios_backgroundColor="#D1D1D6"
              style={styles.switch}
            />
            <View
              style={[
                styles.switchLoaderOverlay,
                !isStatusLoading && styles.hidden,
              ]}
              pointerEvents="none"
            >
              <ActivityIndicator
                size="small"
                color={colors.white}
                animating={isStatusLoading}
              />
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Hides a child without unmounting it. Required inside the gradient — see NOTE above.
  hidden: {
    opacity: 0,
  },
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
    // Keeps a long clinic name clear of the notification button.
    gap: 12,
  },
  centerInfoContainer: {
    flex: 1,
    // Without this a long name can push the row wider than the header.
    minWidth: 0,
  },
  centerName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    // Top-aligned so the pin stays on the first line when the address wraps.
    alignItems: 'flex-start',
    gap: 4,
  },
  locationIcon: {
    // Optically centres the pin against the first line of the address.
    marginTop: 2,
  },
  locationText: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.9,
    // A Text in a row sizes to its content and overflows the container; flex makes the
    // address wrap inside the header instead of running under the notification button.
    flex: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    // Never let a long clinic name squeeze the button out of shape.
    flexShrink: 0,
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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    // Centred under the 48pt avatar instead of pinned to its right edge.
    left: (AVATAR_SIZE - mvs(50)) / 2,
    width: mvs(50),
    height: 15,
    backgroundColor: '#34C759',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicatorText: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  doctorSpecialty: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  // A fixed box keeps the row from reflowing between platforms (iOS lays the switch
  // out at 51x31, Android smaller) and while the status request is in flight.
  switchContainer: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  switchLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
