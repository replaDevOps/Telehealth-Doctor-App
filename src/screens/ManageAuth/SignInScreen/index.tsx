import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import parsePhoneNumberFromString from 'libphonenumber-js';
import { login } from '../../../services/api/authService';
import { useAuthStore, User } from '../../../store';
import { Toast } from 'toastify-react-native';

export function SignInScreen({ navigation }) {
  const { login: setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [countryCode, setCountryCode] = useState('PK');
  const [loading, setLoading] = useState(false);

  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  const handleSignIn = async () => {
    // Clear previous errors
    setPhoneError('');
    setPasswordError('');
    setErrorMessage('');
    
    let valid = true;

    // Phone validation
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      valid = false;
    } else {
      setPhoneError('');
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }

    setLoading(true);

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

        // Navigate to main screen
        navigation.replace('Main', { screen: 'Home' });
        
        // Show success message after navigation (to avoid blocking navigation)
        // Using setTimeout to ensure navigation happens first
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
      const errorMsg = 
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials and try again.';
      setErrorMessage(errorMsg);
      // Only show error toast if it's a real error (not success message)
      if (!errorMsg.toLowerCase().includes('successful')) {
        try {
          Toast.error(errorMsg);
        } catch (toastError) {
          console.log('Toast error (non-critical):', toastError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

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
            <CustomText text="Welcome Back" />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              Login and continue your healthy journey today!
            </Text>
          </View>

          {/* Phone Input */}
          <View style={{ marginTop: mvs(25) }}>
            <Text style={styles.label}>Phone Number</Text>
            <PhoneNumberInput
              phone={phone}
              setPhone={setPhone}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phoneError={phoneError}
              errorMessage={errorMessage}
              onValidationChange={setIsPhoneValid}
              CustomStyle={{ backgroundColor: colors.white }}
            />
          </View>

          {/* Password Input */}
          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            errorMessage={passwordError}
          />

          {/* Sign In Button */}
          <CustomButton
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleSignIn}
            disabled={loading}
            loading={loading}
          />

          {/* Sign Up Link */}
          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>Need Help? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signinLink}>Contact admin</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
