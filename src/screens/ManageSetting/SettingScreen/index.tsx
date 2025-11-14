import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import UserProfile from '../../../components/common/UserProfile';
import { Header2 } from '../../../components/common/Header2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';

import { ProfileSvg, LogoutSvg } from '@assets/icons';
import style from './style';
import { mvs } from '@config/metrices';
import { InfoSection } from '@components/common';
import { PERSONAL_DATA, WORKING_HOURS_DATA } from '@constants';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const [profileImage, setProfileImage] = useState<string>('');

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  // =============== Menu Data ===============
  const menuData = [
    {
      icon: ProfileSvg,
      title: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: LogoutSvg,
      title: 'Log Out',
      backgroundColor: '#FEECED',
      textColor: '#EB5757',
      onPress: handleLogout,
    },
  ];

  // =============== Render Menu Item ===============
  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const isLogout = item.title === 'Log Out';

    return (
      <TouchableOpacity
        key={index}
        style={[
          style.menuItem,
          {
            backgroundColor: isLogout ? colors.red : colors.gray,
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={style.menuLeft}>
          <Icon width={24} height={24} />
          <Text style={[style.menuTitle, isLogout && { color: colors.white }]}>
            {item.title}
          </Text>
        </View>
        {isLogout ? null : <AntDesign name="right" size={20} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title="Setting" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: mvs(30) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={style.container}>
          {/* User Profile Section */}
          <UserProfile
            profileImage={profileImage}
            onImageSelected={handleImageSelected}
          />

          <View style={{ marginVertical: mvs(10) }} />

          <InfoSection title="Personal Information" data={PERSONAL_DATA} />
          <InfoSection title="Working Hour" data={WORKING_HOURS_DATA} />

          {/* Menu Items */}
          {menuData.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
