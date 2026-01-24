import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';

import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { CustomDropdown } from '../../../components/common/CustomDropdwon';
import UserProfile from '../../../components/common/UserProfile';
import { CustomButton } from '../../../components/common/CustomButton';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { styles } from './style';
import PhoneNumberInput from '../../../components/common/PhoneTextInput';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  SetupProfile: undefined;
  SignIn: undefined; // Replace with actual next screen
};

type NavProps = StackNavigationProp<RootStackParamList, 'SetupProfile'>;

interface Props {
  navigation: NavProps;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('PK');
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [nationality, setNationality] = useState('');
  const [IdCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [idError, setIdError] = useState('');
  const [nationalityError, setNationalityError] = useState('');
  const [genderError, setGenderError] = useState('');

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleSaveAndContinue = () => {
    let valid = true;

    // Reset errors
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setIdError('');
    setAgeError('');
    setNationalityError('');
    setGenderError('');

    if (!fullName.trim()) {
      setNameError(t('validation.nameRequired'));
      valid = false;
    }
    if (!email.trim() || !email.includes('@')) {
      setEmailError(t('validation.validEmail'));
      valid = false;
    }
    if (!phone.trim() || !isPhoneValid) {
      setPhoneError(t('validation.validPhone'));
      valid = false;
    }
    if (!nationality) {
      setNationalityError(t('validation.selectNationality'));
      valid = false;
    }
    if (!IdCardNumber.trim()) {
      setIdError(t('validation.idRequired'));
      valid = false;
    }
    if (!gender) {
      setGenderError(t('validation.selectGender'));
      valid = false;
    }
    if (!age.trim()) {
      setAgeError(t('validation.ageRequired'));
      valid = false;
    }
    if (!profileImage) {
      /* show image error if needed */ valid = false;
    }

    if (valid) {
      navigation.navigate('SignIn');
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="" showLanguage={true} />

        <View style={styles.container}>
          <UserProfile
            profileImage={profileImage}
            onImageSelected={handleImageSelected}
          />

          <View style={styles.content}>
            <CustomText text={t('profile.setupTitle')} />
            <Text style={styles.TextContent}>{t('profile.setupDescription')}</Text>
          </View>

          <CustomTextInput
            label={t('profile.fullName')}
            placeholder={t('profile.fullName')}
            value={fullName}
            onChangeText={setFullName}
            errorMessage={nameError}
          />

          <CustomTextInput
            label={t('profile.email')}
            placeholder={t('profile.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={emailError}
          />

          <Text style={styles.label}>{t('profile.phone')}</Text>
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

          <CustomDropdown
            label={t('profile.personalInfo')}
            placeholder={t('profile.selectNationality')}
            value={nationality}
            onValueChange={setNationality}
            errorMessage={nationalityError} // Add
            options={[
              { label: 'Pakistani', value: 'pak' },
              { label: 'Afghani', value: 'afg' },
              { label: 'Indian', value: 'ind' },
              { label: 'Chines', value: 'ch' },
              { label: 'American', value: 'usa' },
            ]}
          />

          <CustomTextInput
            label={t('profile.nationality')}
            placeholder={t('profile.nationality')}
            value={IdCardNumber}
            onChangeText={setIdCardNumber}
            keyboardType="numeric"
            errorMessage={idError}
          />

          <CustomDropdown
            label={t('profile.gender')}
            placeholder={t('profile.selectGender')}
            value={gender}
            onValueChange={setGender}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
            errorMessage={genderError}
          />

          <CustomTextInput
            label={t('profile.age')}
            placeholder={t('profile.age')}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            errorMessage={ageError}
          />
        </View>
        <CustomButton title={t('common.continue')} onPress={handleSaveAndContinue} />
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};
