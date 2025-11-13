import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageScreen, OnboardingScreen, SignInScreen } from '@screens';

export type AuthStackParamList = {
  SignIn: undefined;
  LanguageSelection: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="LanguageSelection"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LanguageSelection" component={LanguageScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
