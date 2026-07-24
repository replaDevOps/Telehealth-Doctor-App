import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mvs } from '../../config/metrices';
const LogoPng = require('../../assets/images/LOGOPNG.png');
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../styles/colors';
import { useAuthStore, useProfileStore } from '../../store';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isAuthenticated, isLoading, token } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    // Wait for store to finish hydrating before checking authentication
    if (isLoading) {
      console.log('Store is still loading, waiting...');
      return;
    }

    const checkAndNavigate = async () => {
      try {
        // Add a small delay to ensure store is fully hydrated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Re-check auth state after delay
        const currentState = useAuthStore.getState();
        const currentToken = currentState.token;
        const currentIsAuthenticated = currentState.isAuthenticated;
        
        console.log('Auth check - Token:', !!currentToken, 'isAuthenticated:', currentIsAuthenticated);
        
        // Use token presence as the source of truth for authentication
        // This ensures we check the actual persisted state
        const isUserAuthenticated = !!currentToken || currentIsAuthenticated;
        
        // If user is authenticated, fetch profile data once on app start
        if (isUserAuthenticated) {
          fetchProfile();
        }
        
        setTimeout(() => {
          // Check authentication FIRST - authenticated users should skip language/onboarding
          if (isUserAuthenticated) {
            console.log('User is authenticated, navigating to Main');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Home' } }],
            });
            return;
          }
          
          // Only check language and onboarding if user is NOT authenticated
          Promise.all([
            AsyncStorage.getItem('selectedLanguage'),
            AsyncStorage.getItem('onboardingCompleted'),
          ]).then(([selectedLanguage, onboardingCompleted]) => {
            // Double-check auth state before navigating (in case it changed)
            const recheckState = useAuthStore.getState();
            const recheckAuth = !!recheckState.token || recheckState.isAuthenticated;
            
            if (recheckAuth) {
              console.log('User became authenticated during language check, navigating to Main');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Home' } }],
              });
              return;
            }
            
            // Navigation logic:
            // 1. If no language selected -> LanguageSelection
            // 2. If language selected but onboarding not completed -> Onboarding
            // 3. If language selected and onboarding completed -> SignIn
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
          }).catch((error) => {
            console.error('Error checking language/onboarding:', error);
            // On error, check auth again
            const recheckState = useAuthStore.getState();
            const recheckAuth = !!recheckState.token || recheckState.isAuthenticated;
            if (recheckAuth) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Home' } }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth', params: { screen: 'SignIn' } }],
              });
            }
          });
        }, 3000);
      } catch (error) {
        console.error('Error during navigation check:', error);
        // On error, check auth state again
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
    <View style={styles.logoContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={LogoPng} style={{ width: mvs(250), height: mvs(200) }} resizeMode="contain" />
      </Animated.View>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ position: 'absolute', bottom: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
