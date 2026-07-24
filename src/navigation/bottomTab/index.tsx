import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../../styles/colors';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import {
  HomeSvg,
  SettingSvg,
  HistorySvg,
  FHomeSvg,
  fSettingSvg,
  fHistorySvg,
} from '../../assets/icons';
import {
  HistoryNavigator,
  HomeNavigator,
  SettingNavigator,
} from '@navigation/MainNavigator';

export type TabParamList = {
  Home: undefined;
  Clinic: undefined;
  History: undefined;
  Setting: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function CustomTabBar() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: (() => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';

          const showTabScreens = [
            'HomeScreen',
            'ClinicScreen',
            'HistoryScreen',
            'SettingScreen',
          ];

          if (!showTabScreens.includes(routeName) && routeName !== '') {
            return { display: 'none' };
          }

          return {
            ...styles.tabBar,
            height: 65 + insets.bottom,
            paddingBottom: 5 + insets.bottom,
          };
        })(),

        tabBarIcon: ({ focused }) => {
          let SvgComponent;
          let label = '';
          switch (route.name) {
            case 'Home':
              SvgComponent = focused ? FHomeSvg : HomeSvg;
              label = t('home.title');
              break;

            case 'History':
              SvgComponent = focused ? fHistorySvg : HistorySvg;

              label = t('history.title');
              break;
            case 'Setting':
              SvgComponent = focused ? fSettingSvg : SettingSvg;

                label = t('settings.title');
              break;
          }
          return (
            <View style={styles.iconLabelWrapper}>
              {SvgComponent && (
                <SvgComponent width={24} height={24} fill={''} />
              )}
              <Text
                numberOfLines={1}
                style={[
                  styles.labelText,
                  { color: focused ? colors.primary : colors.secondary },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="History" component={HistoryNavigator} />
      <Tab.Screen name="Setting" component={SettingNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    height: 65,
    paddingBottom: 5,
    paddingTop: 5,
  },
  iconLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    paddingTop: 10,
    gap: 8,
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    width: '100%',
  },
});
