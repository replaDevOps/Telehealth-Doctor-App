import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import { LogoSvg } from '../../../assets/icons';
import { CustomText } from '../../../components/common/CustomText';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { styles } from './style';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../../../services/api/authService';
import { useAuthStore, User, useProfileStore } from '../../../store';
import { Toast } from 'toastify-react-native';

export function SignInScreen({ navigation }) {
  const { t } = useTranslation();
  const { login: setAuth } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [countryCode, setCountryCode] = useState('SA');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSignIn = async () => {
    // Clear previous validation errors (user errors only)
    setPhoneError('');
    setPasswordError('');
    
    let valid = true;

    // Phone validation: only require non-empty for API call (format validation commented out)
    if (!phone.trim()) {
      setPhoneError(t('auth.phoneRequired'));
      valid = false;
    } else {
      setPhoneError('');
    }
    // else if (!isPhoneValid) {
    //   setPhoneError(t('auth.invalidPhone'));
    //   valid = false;
    // }

    // Password validation (user error - show under input)
    if (!password.trim()) {
      setPasswordError(t('auth.passwordRequired'));
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }

    setLoading(true);
    console.log('Phone:', phone);
    console.log('Password:', password);
    try {
      // Call login API
      const response = await login({
        phoneNo: phone.trim(),
        password: password.trim(),
      });

      console.log('Login response:', response);

      // API response structure: { status: true, message: "...", user: { id, name, email, type, token, refreshToken } }
      if (response.status === true && response.user) {
        const userInfo = response.user;
        
        // Extract token and refreshToken from user object
        const token = userInfo.token;
        const refreshToken = userInfo.refreshToken;
        
        if (!token) {
          throw new Error('Token not found in response');
        }

        // Map API response to User interface
        const userData: User = {
          id: String(userInfo.id),
          email: userInfo.email || '',
          name: userInfo.name || '',
          role: 'doctor',
          phone: userInfo.phoneNo || phone.trim(),
        };

        // Store user, token, and refreshToken in auth store
        setAuth(userData, token, refreshToken);

        // Fetch profile data after successful login
        try {
          await fetchProfile();
        } catch (profileError) {
          console.error('Failed to fetch profile after login:', profileError);
          // Don't block navigation if profile fetch fails
        }

        // Navigate to main screen
        navigation.replace('Main', { screen: 'Home' });
        
        // Save credentials if remember me is checked
        try {
          if (remember) {
            await AsyncStorage.setItem('rememberMePhone', phone.trim());
            await AsyncStorage.setItem('rememberMePassword', password.trim());
            await AsyncStorage.setItem('rememberMeCountryCode', countryCode);
          } else {
            await AsyncStorage.multiRemove([
              'rememberMePhone',
              'rememberMePassword',
              'rememberMeCountryCode',
            ]);
          }
        } catch (e) {
          console.warn('Failed to persist credentials', e);
        }

        // Show success message after navigation (to avoid blocking navigation)
        setTimeout(() => {
          try {
            const successMsg = response.message || 'Login successful';
            Toast.success(successMsg);
          } catch (toastError) {
            console.log('Toast error (non-critical):', toastError);
          }
        }, 100);
      } else {
        // If status is false or user is missing
        throw new Error(response.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Login error response:', error?.response);
      console.error('Login error data:', error?.response?.data);
      
      // Extract error message from various possible API error structures
      // Structure 1: { status: 401, message: "...", data: { success: false, message: "...", error: "..." } }
      // Structure 2: { data: { message: "..." } }
      // Structure 3: { message: "..." }
      const errorMsg = 
        error?.response?.data?.data?.error || // Most specific error message (e.g., "Invalid email, password, or user type")
        error?.response?.data?.data?.message || // Message from nested data (e.g., "Unauthorized")
        error?.response?.data?.message || // Message from data (e.g., "Unauthorized")
        error?.response?.message || // Message from response (e.g., "Unauthorized")
        error?.message || // General error message
        'Login failed. Please check your credentials and try again.';
      
      console.log('Extracted error message:', errorMsg);
      
      // Show API error in toast
      try {
        Toast.error(errorMsg);
      } catch (toastError) {
        console.log('Toast error (non-critical):', toastError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const savedPhone = await AsyncStorage.getItem('rememberMePhone');
        const savedPassword = await AsyncStorage.getItem('rememberMePassword');
        const savedCountry = await AsyncStorage.getItem('rememberMeCountryCode');
        if (savedPhone) {
          setPhone(savedPhone);
          setRemember(true);
        }
        if (savedPassword) setPassword(savedPassword);
        if (savedCountry) setCountryCode(savedCountry);
      } catch (e) {
        console.warn('Failed to load saved credentials', e);
      }
    };

    loadSaved();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: mvs(30) }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Header2 title="" showLanguage={true} />

          {/* Logo */}
          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>

          {/* Title */}
          <View style={styles.title}>
            <CustomText text={t('auth.welcomeBack')} />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('auth.loginSubtitle')}
            </Text>
          </View>

          {/* Phone Input */}
          <View style={{ marginTop: mvs(25) }}>
            <Text style={styles.label}>{t('auth.phoneNumber')}</Text>
            <PhoneNumberInput
              phone={phone}
              setPhone={(v) => {
                setPhone(v);
                if (phoneError) setPhoneError('');
              }}
              countryCode={countryCode}
              setCountryCode={(code) => {
                setCountryCode(code);
                if (phoneError) setPhoneError('');
              }}
              phoneError={phoneError}
              onValidationChange={setIsPhoneValid}
              CustomStyle={{ backgroundColor: colors.white }}
            />
          </View>

          {/* Password Input */}
          <CustomTextInput
            label={t('auth.password')}
            placeholder={t('auth.enterPassword')}
            value={password}
            onChangeText={(text: string) => {
              // Clear previous password error when user starts typing
              if (passwordError) setPasswordError('');
              setPassword(text);
            }}
            secureTextEntry={true}
            errorMessage={passwordError}
          />

          {/* <View style={styles.PasswordRemember}>
            <View style={styles.CheckBox}>
              <TouchableOpacity
                onPress={() => setRemember(!remember)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: remember }}
              >
                <Ionicons
                  name={remember ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={remember ? colors.primary : colors.border}
                />
              </TouchableOpacity>
              <Text style={styles.TextContent}>Remember me</Text>
            </View>

            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.signinLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View> */}

          {/* Sign In Button */}
          <CustomButton
            title={t('auth.signIn')}
            onPress={handleSignIn}
            loading={loading}
          />

          {/* Sign Up Link */}
          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('common.needHelp')} </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.signinLink}>{t('common.contactAdmin')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
