import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomTabBar from './bottomTab';
import { HomeScreen, NotificationScreen } from '@screens';
import { HistoryScreen } from '@screens/ManageHistory';
import {
  ChangePassword,
  Settings,
  SettingScreen,
} from '@screens/ManageSetting';
import {
  AudioConsultation,
  ChatScreen,
  PrescriptionScreen,
  VideoConsultation,
} from '@screens/Comman';
import SignatureScreen from '@screens/ManageSetting/Signature';

export type MainStackParamList = {
  Home: undefined;
  History: undefined;
  Setting: undefined;
  CustomTabBar: undefined;
};

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="EntryPoint"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="EntryPoint" component={CustomTabBar} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="PrescriptionScreen" component={PrescriptionScreen} />
      <Stack.Screen name="AudioConsultation" component={AudioConsultation} />
      <Stack.Screen name="VideoConsultation" component={VideoConsultation} />
    </Stack.Navigator>
  );
};

export const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export const HistoryNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="HistoryScreen"
    >
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export const SettingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="SignatureScreen" component={SignatureScreen} />
    </Stack.Navigator>
  );
};
