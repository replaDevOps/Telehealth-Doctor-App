import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Header2 } from '../../../components/common/Header2';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';

import { SignatureSvg, PasswordSvg } from '@assets/icons';
import style from './style';
import { mvs } from '@config/metrices';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const Settings = ({ navigation }: { navigation: any }) => {
  // =============== Menu Data ===============
  const menuData = [
    {
      icon: SignatureSvg,
      title: 'My Signature',
      onPress: () => navigation.navigate('SignatureScreen'),
    },
    {
      icon: PasswordSvg,
      title: 'Password Manager',
      onPress: () => navigation.navigate('ChangePassword'),
    },
  ];

  // =============== Render Menu Item ===============
  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;

    return (
      <TouchableOpacity
        key={index}
        style={[style.menuItem]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={style.menuLeft}>
          <Icon width={24} height={24} />
          <Text style={[style.menuTitle]}>{item.title}</Text>
        </View>
        <AntDesign name="right" size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Header2 title="Settings" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: mvs(30) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={style.container}>
          {/* Menu Items */}
          {menuData.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
