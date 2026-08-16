import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore, useProfileStore } from '../../store';
import { SingleLogo } from '../../assets/icons';
import { SplashLogo } from '../../assets/images';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  // The logo is intentionally NOT animated in: it is drawn at the same size and
  // position as the native launch screen, so the handover is seamless. Only the
  // secondary lockup fades in.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigatedRef = useRef(false);

  const { isAuthenticated, isLoading, token } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (isLoading) {
      console.log('Store is still loading, waiting...');
      return;
    }

    const checkAndNavigate = async () => {
      if (hasNavigatedRef.current) {
        return;
      }
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const currentState = useAuthStore.getState();
        const currentToken = currentState.token;
        const currentIsAuthenticated = currentState.isAuthenticated;

        const isUserAuthenticated = !!currentToken || currentIsAuthenticated;

        if (isUserAuthenticated) {
          fetchProfile();
        }

        const minSplashDuration = new Promise(resolve => setTimeout(resolve, 1500));
        await minSplashDuration;

        if (hasNavigatedRef.current) {
          return;
        }

        if (isUserAuthenticated) {
          console.log('User is authenticated, navigating to Main');
          hasNavigatedRef.current = true;
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Home' } }],
          });
          return;
        }

        const [selectedLanguage, onboardingCompleted] = await Promise.all([
          AsyncStorage.getItem('selectedLanguage'),
          AsyncStorage.getItem('onboardingCompleted'),
        ]);

        const recheckState = useAuthStore.getState();
        const recheckAuth = !!recheckState.token || recheckState.isAuthenticated;

        if (hasNavigatedRef.current) {
          return;
        }
        hasNavigatedRef.current = true;

        if (recheckAuth) {
          console.log('User became authenticated during language check, navigating to Main');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Home' } }],
          });
          return;
        }

        if (!selectedLanguage) {
          console.log('No language selected, navigating to LanguageSelection');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth', params: { screen: 'LanguageSelection' } }],
          });
        } else if (!onboardingCompleted) {
          console.log('Language selected but onboarding not completed, navigating to Onboarding');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth', params: { screen: 'Onboarding' } }],
          });
        } else {
          console.log('Language selected and onboarding completed, navigating to SignIn');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth', params: { screen: 'SignIn' } }],
          });
        }
      } catch (error) {
        console.error('Error during navigation check:', error);
        if (hasNavigatedRef.current) {
          return;
        }
        hasNavigatedRef.current = true;

        const currentState = useAuthStore.getState();
        const isUserAuthenticated = !!currentState.token || currentState.isAuthenticated;
        if (isUserAuthenticated) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Home' } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth', params: { screen: 'LanguageSelection' } }],
          });
        }
      }
    };

    checkAndNavigate();
  }, [isLoading, token, isAuthenticated, navigation]);

  const lockupColor = '#4A148C';

  return (
    <View style={styles.container}>
      {/* Brand mark — matches the native launch screen exactly (160pt, centred). */}
      <Image source={SplashLogo} style={styles.logo} resizeMode="contain" />

      {/* Small Bottom Lockup: فينا VENA */}
      <Animated.View style={[styles.bottomLockup, { opacity: fadeAnim }]}>
        <Text style={[styles.arabicText, { color: lockupColor }]}>فينا</Text>
        <View style={styles.heartWrapper}>
          <SingleLogo width={16} height={15} fill={lockupColor} />
        </View>
        <Text style={[styles.englishText, { color: lockupColor }]}>VENA</Text>
      </Animated.View>

      <Animated.View style={[styles.loader, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color="#4A148C" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 160,
    height: 160,
  },
  bottomLockup: {
    position: 'absolute',
    bottom: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  heartWrapper: {
    marginHorizontal: 3,
  },
  englishText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  loader: {
    position: 'absolute',
    bottom: 100,
  },
});
