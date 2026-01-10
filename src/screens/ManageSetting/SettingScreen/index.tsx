import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useAuthStore, useProfileStore } from '../../../store';
import { logout as logoutApi } from '../../../services/api/authService';
import { Toast } from 'toastify-react-native';

import style from './style';


export const SettingScreen = ({ navigation }: { navigation: any }) => {
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
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
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
  const displayWorkingHours = profileData?.working_hours?.map(item => ({
    day: item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase(),
    time: item.status === 1 ? `${item.fromTime} - ${item.toTime}` : 'Day Off',
    isDayOff: item.status !== 1,
  })) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title="Setting" />

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
            <Text style={style.sectionTitle}>Personal Information</Text>
          </View>
          <View style={style.card}>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Full Name:</Text>
              <Text style={style.infoValue}>{profileData?.name || 'N/A'}</Text>
            </View>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Phone Number:</Text>
              <Text style={style.infoValue}>{profileData?.phoneNo || 'N/A'}</Text>
            </View>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Email Address:</Text>
              <Text style={style.infoValue}>{profileData?.email || 'N/A'}</Text>
            </View>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Specialization:</Text>
              <Text style={style.infoValue}>{profileData?.specialization || 'N/A'}</Text>
            </View>
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Year of Experience:</Text>
              <Text style={style.infoValue}>{profileData?.experience ? `${profileData.experience} Years` : 'N/A'}</Text>
            </View>
          </View>

          {/* Working Hour */}
          <View style={style.sectionHeader}>
            <Text style={style.sectionTitle}>Working Hour</Text>
          </View>
          <View style={style.card}>
            {displayWorkingHours.length > 0 ? (
              displayWorkingHours.map((item, index) => (
                <View key={index} style={style.infoRow}>
                  <Text style={style.infoLabel}>{item.day}</Text>
                  {item.isDayOff ? (
                    <View style={style.dayOffContainer}>
                      <Ionicons name="ban-outline" size={16} color="#9CA3AF" style={{ marginRight: 5 }} />
                      <Text style={style.dayOffText}>Day Off</Text>
                    </View>
                  ) : (
                    <Text style={style.workingTimeText}>{item.time}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={[style.infoValue, { textAlign: 'center', padding: 10 }]}>No working hours available</Text>
            )}
          </View>


          {/* Settings Button */}
          <TouchableOpacity
            style={[style.menuItem, { marginTop: 25 }]}
            onPress={() => navigation.navigate('ProfileSetting')}
            activeOpacity={0.7}
          >
            <View style={style.menuLeft}>
              <Ionicons name="settings-outline" size={24} color={colors.black} />
              <Text style={style.menuTitle}>Settings</Text>
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
            <Text style={style.logoutText}>Log Out</Text>
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
          <Text style={style.loadingText}>Logging Out...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

