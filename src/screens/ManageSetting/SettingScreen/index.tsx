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
      onPress: () => navigation.navigate('ProfileSetting'), // Fixed loop!
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
            // marginTop: isLogout ? 30 : 0,
            backgroundColor: isLogout ? colors.red : colors.gray,
            // paddingVertical: isLogout ? 16 : 20,
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

  const personalData = [
    { label: 'Full Name:', value: 'Ali Abdul Aziz' },
    { label: 'Phone Number:', value: '+966 324 464 232' },
    { label: 'Email Address:', value: 'abc@gmail.com' },
    { label: 'Specialization:', value: 'MBBS' },
    { label: 'Year of Experience:', value: '10 Years' },
  ];
  const workingHoursData = [
    { label: 'Monday:', value: '9:00 PM - 6:00 PM' },
    { label: 'Tuesday:', value: '9:00 PM - 6:00 PM' },
    { label: 'Wednesday:', value: '9:00 PM - 6:00 PM' },
    { label: 'Thursday:', value: '9:00 PM - 6:00 PM' },
    { label: 'Friday:', value: '9:00 PM - 6:00 PM' },
    { label: 'Saturday:', value: 'Day Off', isDayOff: true },
    { label: 'Sunday:', value: 'Day Off', isDayOff: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title="Settings" />

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

          <InfoSection title="Personal Information" data={personalData} />
          <InfoSection title="Working Hour" data={workingHoursData} />

          {/* Menu Items */}
          {menuData.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
