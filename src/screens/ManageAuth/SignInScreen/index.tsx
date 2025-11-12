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

export function SignInScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [countryCode, setCountryCode] = useState('PK');

  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  const handleSignIn = () => {
    let valid = true;

    // Phone validation
    // if (!phone.trim() || !isPhoneValid) {
    //   setPhoneError('Invalid phone number');
    //   valid = false;
    // } else setPhoneError('');

    // Password validation
    // if (!password.trim()) {
    //   setPasswordError('Password is required');
    //   valid = false;
    // } else setPasswordError('');

    // Final navigation
    if (valid) {
      navigation.navigate('Main', { screen: 'Home' });
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
          <CustomButton title="Sign In" onPress={handleSignIn} />

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
