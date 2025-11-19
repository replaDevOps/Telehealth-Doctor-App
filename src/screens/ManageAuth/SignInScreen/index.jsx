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
import { useAuthStore } from '@store';
import { useTranslation } from 'react-i18next';

export function SignInScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [countryCode, setCountryCode] = useState('PK');
  const { login } = useAuthStore();
  const { t } = useTranslation();

  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  const formattedPhone = phoneNumber
    ? `+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`
    : `+${phone}`;

  const handleSignIn = () => {
    let valid = true;

    if (!phone.trim() || !isPhoneValid) {
      setPhoneError(t('invalid_phone_number'));
      valid = false;
    } else setPhoneError('');

    if (!password.trim()) {
      setPasswordError(t('password_required'));
      valid = false;
    } else setPasswordError('');

    if (valid) {
      const User = { phone: formattedPhone, password: password };
      const fakeToken = 'abc123';

      login(User, fakeToken);

      // ✅ Navigate to home screen
      navigation.navigate('Main', { screen: 'Home' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <CustomText text={t('welcome_back')} />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('login_continue_journey')}
            </Text>
          </View>

          {/* Phone Input */}
          <View style={{ marginTop: mvs(25) }}>
            <Text style={styles.label}>{t('phone_number')}</Text>
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
            label={t('password')}
            placeholder={t('enter_your_password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            errorMessage={passwordError}
          />

          {/* Sign In Button */}
          <CustomButton title={t('sign_in')} onPress={handleSignIn} />

          {/* Sign Up Link */}
          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('need_help')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signinLink}>{t('contact_admin')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
