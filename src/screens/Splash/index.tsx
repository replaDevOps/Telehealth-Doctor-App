import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore, useProfileStore } from '../../store';
import { SingleLogo } from '../../assets/icons';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const hasNavigatedRef = useRef(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { isAuthenticated, isLoading, token } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

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

  const lockupColor = isDarkMode ? '#FFFFFF' : '#4A148C';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1930' : '#FFFFFF' }]}>
      {/* Centered App Icon Card with Soft Shadow */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCard}>
          <SingleLogo width={68} height={64} fill="#FFFFFF" />
        </View>
      </Animated.View>

      {/* Small Bottom Lockup: فينا VENA */}
      <Animated.View style={[styles.bottomLockup, { opacity: fadeAnim }]}>
        <Text style={[styles.arabicText, { color: lockupColor }]}>فينا</Text>
        <View style={styles.heartWrapper}>
          <SingleLogo width={16} height={15} fill={lockupColor} />
        </View>
        <Text style={[styles.englishText, { color: lockupColor }]}>VENA</Text>
      </Animated.View>

      <ActivityIndicator
        size="small"
        color="#4A148C"
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCard: {
    width: 120,
    height: 120,
    borderRadius: 34,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
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
