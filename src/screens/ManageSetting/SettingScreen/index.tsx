import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { contactAdmin } from '@utils/contactAdmin';
import { useTranslation } from 'react-i18next';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useAuthStore, useProfileStore } from '../../../store';
import { logout as logoutApi } from '../../../services/api/authService';
import { Toast } from 'toastify-react-native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import style from './style';

const formatPhoneWithCountryCode = (phoneNo?: string): string => {
  if (!phoneNo) return 'N/A';
  const trimmed = phoneNo.trim();
  let phoneWithPlus: string;
  if (trimmed.startsWith('+')) {
    phoneWithPlus = trimmed;
  } else {
    const digitsOnly = trimmed.replace(/\D/g, '');
    phoneWithPlus = digitsOnly.startsWith('966') ? `+${digitsOnly}` : `+966${digitsOnly}`;
  }
  const parsed = parsePhoneNumberFromString(phoneWithPlus);
  return parsed ? parsed.formatInternational() : phoneWithPlus;
};


export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const { profileData, clearProfile, fetchProfile, refreshProfile, isLoading } = useProfileStore();
  const [profileImage, setProfileImage] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile image when profile data is loaded
  useEffect(() => {
    if (profileData?.image) {
      setProfileImage(profileData.image);
    }
  }, [profileData]);

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleRefresh = async () => {
    // Force refresh by clearing cache and fetching fresh data
    await refreshProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      t('settingsScreen.logoutConfirmTitle'),
      t('settingsScreen.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settingsScreen.logoutConfirmTitle'),
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logoutApi();
            } catch (error: any) {
              // Even if API call fails, proceed with logout
              console.log('Logout API error:', error);
            }

            // Clear stores and navigate
            logout();
            clearProfile();
            navigation.getParent()?.getParent()?.replace('Auth', { screen: 'SignIn' });

            // Note: setIsLoggingOut(false) is not needed as component unmounts on navigation
            // Show success message after navigation
            setTimeout(() => {
              try {
                Toast.success('Logged out successfully');
              } catch (toastError) {
                console.log('Toast error (non-critical):', toastError);
              }
            }, 100);
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Format working hours from API
  const displayWorkingHours = profileData?.working_hours?.map(item => {
    const rawDay = (item.day || '').toLowerCase();
    const formattedDefault = item.day ? item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase() : '';
    return {
      day: t(`days.${rawDay}`, { defaultValue: formattedDefault }),
      time: item.status === 1 ? `${item.fromTime} - ${item.toTime}` : t('settingsScreen.dayOff'),
      isDayOff: item.status !== 1,
    };
  }) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top']}>
      <Header2 title={t('settings.title')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={style.container}>
          {/* User Profile Section */}
          <UserProfile
            profileImage={profileImage}
            onImageSelected={handleImageSelected}
          />

          {/* Personal Information */}
          <View style={style.sectionHeader}>
            <Text style={style.sectionTitle}>{t('settingsScreen.personalInformation')}</Text>
          </View>
          <View style={style.card}>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>{t('profile.fullName')}:</Text>
              <Text style={style.infoValue}>{profileData?.name || 'N/A'}</Text>
            </View>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>{t('profile.phone')}:</Text>
              <Text style={style.infoValue}>{formatPhoneWithCountryCode(profileData?.phoneNo)}</Text>
            </View>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>{t('profile.email')}:</Text>
              <Text style={style.infoValue}>{profileData?.email || 'N/A'}</Text>
            </View>
          </View>

          {/* Working Hour */}
          <View style={style.sectionHeader}>
            <Text style={style.sectionTitle}>{t('settingsScreen.workingHour')}</Text>
          </View>
          <View style={style.card}>
            {displayWorkingHours.length > 0 ? (
              displayWorkingHours.map((item, index) => (
                <View key={index} style={style.infoRow}>
                  <Text style={style.infoLabel}>{item.day}</Text>
                  {item.isDayOff ? (
                    <View style={style.dayOffContainer}>
                      <Ionicons name="ban-outline" size={16} color="#9CA3AF" style={{ marginRight: 5 }} />
                      <Text style={style.dayOffText}>{t('settingsScreen.dayOff')}</Text>
                    </View>
                  ) : (
                    <Text style={style.workingTimeText}>{item.time}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={[style.infoValue, { textAlign: 'center', padding: 10 }]}>{t('settingsScreen.noWorkingHours')}</Text>
            )}
          </View>


          {/* Password Manager */}
          <TouchableOpacity
            style={[style.menuItem, { marginTop: 25 }]}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <View style={style.menuLeft}>
              <Ionicons name="key-outline" size={24} color={colors.black} />
              <Text style={style.menuTitle}>{t('settings.passwordManager')}</Text>
            </View>
            <AntDesign name="right" size={20} color="#9CA3AF" />
          </TouchableOpacity>



          {/* Contact Admin */}
          <TouchableOpacity
            style={style.menuItem}
            onPress={contactAdmin}
            activeOpacity={0.7}
          >
            <View style={style.menuLeft}>
              <Ionicons name="mail-outline" size={24} color={colors.black} />
              <Text style={style.menuTitle}>{t('settings.contactAdmin')}</Text>
            </View>
            <AntDesign name="right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={style.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={20} color={colors.white} />
            <Text style={style.logoutText}>{t('settings.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Modal for Logout */}
      <Modal
        visible={isLoggingOut}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={style.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={style.loadingText}>{t('settingsScreen.loggingOut')}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

