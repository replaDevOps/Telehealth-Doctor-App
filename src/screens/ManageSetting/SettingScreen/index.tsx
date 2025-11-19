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
import { useTranslation } from 'react-i18next';

export const SettingScreen = ({ navigation }: { navigation: any }) => {
  const [profileImage, setProfileImage] = useState<string>('');
  const { t } = useTranslation();

  // =============== Handlers ===============
  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleLogout = () => {
    Alert.alert(
      t('log_out'),
      t('are_you_sure_logout'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('log_out'),
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
      title: t('settings'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: LogoutSvg,
      title: t('log_out'),
      backgroundColor: '#FEECED',
      textColor: '#EB5757',
      onPress: handleLogout,
    },
  ];

  // =============== Render Menu Item ===============
  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    const isLogout = item.title === t('log_out');

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

  const PERSONAL_DATA = [
    { label: 'full_name', value: 'Ali Abdul Aziz' },
    { label: 'phone_number', value: '+966 324 464 232' },
    { label: 'email_address', value: 'abc@gmail.com' },
    { label: 'specialization', value: 'MBBS' },
    { label: 'year_of_experience', value: '10 Years' },
  ];
  const WORKING_HOURS_DATA = [
    { label: 'monday', value: '9:00 PM - 6:00 PM' },
    { label: 'tuesday', value: '9:00 PM - 6:00 PM' },
    { label: 'wednesday', value: '9:00 PM - 6:00 PM' },
    { label: 'thursday', value: '9:00 PM - 6:00 PM' },
    { label: 'friday', value: '9:00 PM - 6:00 PM' },
    { label: 'saturday', value: 'Day Off', isDayOff: true },
    { label: 'sunday', value: 'Day Off', isDayOff: true },
  ];

  return (
    <SafeAreaView style={style.safeArea}>
      <Header2 title={t('setting')} />

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

          <InfoSection title={t('personal_information')} data={PERSONAL_DATA} />
          <InfoSection title={t('working_hour')} data={WORKING_HOURS_DATA} />

          {/* Menu Items */}
          {menuData.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
