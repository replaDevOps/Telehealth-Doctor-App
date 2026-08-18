import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore, useProfileStore } from '../../store';
import { SplashLogo, SplashBottomIcon } from '../../assets/images';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  // The logo and bottom icon animate in with fade, scale, and blur for a smooth handover.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const blurAnim = useRef(new Animated.Value(10)).current;
  const hasNavigatedRef = useRef(false);

  const { isAuthenticated, isLoading, token } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, blurAnim]);

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

  return (
    <View style={styles.container}>
      {/* Brand mark — matches mobile app center icon size with blur & scale animation */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AnimatedImage
          source={SplashLogo}
          style={styles.logo}
          resizeMode="contain"
          blurRadius={blurAnim}
        />
      </Animated.View>

      {/* Bottom Lockup with blur & scale animation */}
      <Animated.View
        style={[
          styles.bottomLockup,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AnimatedImage
          source={SplashBottomIcon}
          style={styles.bottomIcon}
          resizeMode="contain"
          blurRadius={blurAnim}
        />
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 34,
  },
  bottomLockup: {
    position: 'absolute',
    bottom: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIcon: {
    width: 90,
    height: 40,
  },
});


