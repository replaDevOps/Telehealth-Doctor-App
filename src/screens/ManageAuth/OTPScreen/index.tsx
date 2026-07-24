import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  RefObject,
} from 'react';
import { TextInput, TouchableOpacity, View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useIsFocused, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from './style';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { LogoPng } from '../../../assets/images';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { CustomButton } from '../../../components/common/CustomButton';

import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavProps = StackNavigationProp<AuthStackParamList, 'OTPScreen'>;
type RouteProps = RouteProp<AuthStackParamList, 'OTPScreen'>;

interface Props {
  navigation: NavProps;
  route: RouteProps;
}

export const NumberVerification: React.FC<Props> = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState<string[]>(Array(5).fill(''));
  const { t } = useTranslation();

  const inputRefs = useRef<RefObject<TextInput | null>[]>([]);

  useEffect(() => {
    inputRefs.current = Array(5)
      .fill(null)
      .map(() => createRef<TextInput>());
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newValues = [...inputValues];
    newValues[index] = digit;
    setInputValues(newValues);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.current?.focus();
    }

    const filled = newValues.every(v => v.length === 1);
    setLoading(filled);
  };

  const handleNext = () => {
    const otp = inputValues.join('');
    console.log('OTP submitted:', otp);
    navigation.navigate('CreatePassword');
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={LogoPng} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.title}>
            <CustomText text={t('auth.otpCode')} />
          </View>

          <View style={styles.content}>
            <Text style={styles.TextContent}>
              {t('auth.enterOtpDescription', { email: route.params?.email ?? '+91****4@gmail.com' })}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TextInput
                key={idx}
                ref={inputRefs.current[idx] ?? undefined}
                style={styles.inputBox}
                maxLength={1}
                keyboardType="numeric"
                onChangeText={t => handleChangeText(t, idx)}
                value={inputValues[idx]}
                autoFocus={idx === 0 && isFocused}
              />
            ))}
          </View>

          <CustomButton
            title={loading ? t('auth.verifying') : t('auth.confirm')}
            onPress={handleNext}
            // disabled={!loading}
          />

          <View style={styles.signinRow}>
            <Text style={styles.TextContent}>{t('otp.didntReceiveCode')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>{t('otp.resendCode')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
