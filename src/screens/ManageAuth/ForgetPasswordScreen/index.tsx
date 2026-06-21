import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import { LogoPng } from '../../../assets/images';
import { CustomText } from '../../../components/common/CustomText';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { useTranslation } from 'react-i18next';

interface ForgetPasswordScreenProps {
  navigation: any;
}

export function ForgetPasswordScreen({
  navigation,
}: ForgetPasswordScreenProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState(''); // ← ADD
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
          <Header2 title="" showLanguage={true} />

          <View style={styles.logoContainer}>
            <Image source={LogoPng} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={{ ...styles.title }}>
            <CustomText text={t('auth.forgetPasswordTitle')} />
          </View>
          <View style={styles.content}>
            <Text style={styles.TextContent}>{t('forget.description')}</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'email' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('email')}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedTab === 'email' }}
            >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'email' && styles.activeTabText,
                  ]}
                >
                  {t('forget.emailTab')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'phone' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('phone')}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedTab === 'phone' }}
            >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'phone' && styles.activeTabText,
                  ]}
                >
                  {t('forget.phoneTab')}
                </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: mvs(25) }}>
            {selectedTab === 'email' ? (
                <CustomTextInput
                  label={t('forget.emailLabel')}
                  placeholder={t('forget.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  errorMessage={emailError}
                />
            ) : (
              <>
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
              </>
            )}
          </View>

          <CustomButton
            title={t('common.next')}
            onPress={() => {
              let valid = true;

              if (selectedTab === 'email') {
                if (!email.trim() || !email.includes('@')) {
                  setEmailError(t('forget.invalidEmail'));
                  valid = false;
                } else {
                  setEmailError('');
                }
              } else {
                if (!phone.trim() || !isPhoneValid) {
                  setPhoneError(t('forget.invalidPhone'));
                  valid = false;
                } else {
                  setPhoneError('');
                }
              }

              if (valid) {
                navigation.navigate('SetPassword');
              }
            }}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('forget.rememberPassword')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>{t('forget.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
