import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';

// Saudi Arabia: 9 digits only, must start with 5
const SAUDI_NATIONAL_LENGTH = 10;

const getMaxLengthForCountry = (countryCode: string): number => {
  if (countryCode === 'SA') return SAUDI_NATIONAL_LENGTH;
  return 10;
};

// ✅ Props Interface
interface PhoneNumberInputProps {
  phone?: string;
  setPhone?: (phone: string) => void;
  countryCode?: string;
  setCountryCode?: (code: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  phoneError?: string;
  errorMessage?: string;
  editable?: boolean;
  maxLength?: number;
  onValidationChange?: (isValid: boolean) => void;
  initialValue?: string;
  CustomStyle?: ViewStyle;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  phone = '',
  setPhone,
  countryCode,
  setCountryCode,
  placeholder = 'Number goes here',
  containerStyle = {},
  phoneError,
  errorMessage,
  editable = true,
  maxLength,
  onValidationChange,
  initialValue = '',
  CustomStyle,
}) => {
  const [value, setValue] = useState<string>(initialValue || '');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [hasBeenTouched, setHasBeenTouched] = useState<boolean>(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(countryCode || 'SA');
  const [componentKey, setComponentKey] = useState<number>(0);

  const phoneInput = useRef<PhoneInput | null>(null);
  const hasUserTypedRef = useRef<boolean>(false);

  const safeSetCountryCode = setCountryCode || (() => {});
  const safeSetPhone = setPhone || (() => {});

  useEffect(() => {
    if (!hasBeenTouched) {
      if (phone && phone !== value) {
        setValue(phone);
        setComponentKey(prev => prev + 1);
      }

      if (countryCode && countryCode !== selectedCountryCode) {
        setSelectedCountryCode(countryCode);
        setComponentKey(prev => prev + 1);
      }
    }
  }, [phone, countryCode]);

  useEffect(() => {
    if (!value) {
      setIsValid(false);
      onValidationChange?.(false);
      return;
    }
    const isSaudi = selectedCountryCode === 'SA';
    const validByLength = isSaudi
      ? value.length === SAUDI_NATIONAL_LENGTH
      : value.length >= 8 && value.length <= getMaxLengthForCountry(selectedCountryCode);
    const validStartsWith5 = !isSaudi || value[0] === '5';
    const valid = validByLength && validStartsWith5;
    setIsValid(valid);
    onValidationChange?.(valid);
  }, [value, selectedCountryCode]);

  const handleTextChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    const maxLen = getMaxLengthForCountry(selectedCountryCode);
    const limited = digitsOnly.slice(0, maxLen);
    setValue(limited);
    setHasBeenTouched(true);
    hasUserTypedRef.current = true;
    safeSetPhone(limited);
    const isSaudi = selectedCountryCode === 'SA';
    const validByLength = isSaudi
      ? limited.length === SAUDI_NATIONAL_LENGTH
      : limited.length >= 8 && limited.length <= maxLen;
    const validStartsWith5 = !isSaudi || limited[0] === '5';
    const valid = validByLength && validStartsWith5;
    setIsValid(valid);
    onValidationChange?.(true);
  };

  const handleFormattedTextChange = (formattedText: string) => {
    if (!hasUserTypedRef.current) return;

    const parsed = parsePhoneNumberFromString(formattedText);
    let digitsOnly = parsed
      ? parsed.nationalNumber
      : formattedText.replace(/\D/g, '');

    const maxLen = getMaxLengthForCountry(selectedCountryCode);
    digitsOnly = digitsOnly.slice(0, maxLen);

    safeSetPhone(digitsOnly);
    setValue(digitsOnly);
    const isSaudi = selectedCountryCode === 'SA';
    const validByLength = isSaudi
      ? digitsOnly.length === SAUDI_NATIONAL_LENGTH
      : digitsOnly.length >= 8 && digitsOnly.length <= maxLen;
    const validStartsWith5 = !isSaudi || digitsOnly[0] === '5';
    const valid = validByLength && validStartsWith5;
    setIsValid(valid);
    onValidationChange?.(true);
  };

  const handleCountryChange = (country: any) => {
    const newCountry = country.cca2;
    setSelectedCountryCode(newCountry);
    safeSetCountryCode(newCountry);
    setHasBeenTouched(true);

    const maxLen = getMaxLengthForCountry(newCountry);
    const digitsOnly = value.replace(/\D/g, '').slice(0, maxLen);
    if (digitsOnly !== value) {
      setValue(digitsOnly);
      safeSetPhone(digitsOnly);
    }
    const current = digitsOnly || value;
    const isSaudi = newCountry === 'SA';
    const validByLength = isSaudi
      ? current.length === SAUDI_NATIONAL_LENGTH
      : current.length >= 8 && current.length <= maxLen;
    const validStartsWith5 = !isSaudi || current[0] === '5';
    const valid = validByLength && validStartsWith5;
    setIsValid(valid);
    onValidationChange?.(valid);
  };

  // Red input when: parent set error, OR (touched and has value but invalid: not 9 digits or doesn't start with 5 for SA)
  const hasError =
    !!(phoneError || errorMessage) ||
    (hasBeenTouched && value.length > 0 && !isValid);

  return (
    <View>
      <View
        style={[
          styles.phoneInputContainer,
          containerStyle,
          CustomStyle,
          hasError && styles.errorContainer,
        ]}
      >
        <PhoneInput
          key={componentKey}
          ref={phoneInput}
          defaultValue={value}
          defaultCode={selectedCountryCode as any}
          layout="second"
          withDarkTheme={false}
          withShadow={false}
          autoFocus={false}
          disabled={!editable}
          placeholder={placeholder}
          textInputProps={{
            placeholderTextColor: colors.gray,
            editable: editable,
            maxLength: maxLength ?? getMaxLengthForCountry(selectedCountryCode),
            keyboardType: 'phone-pad',
          }}
          onChangeText={handleTextChange}
          onChangeCountry={handleCountryChange}
          onChangeFormattedText={handleFormattedTextChange}
          containerStyle={styles.phoneInputInnerContainer}
          textContainerStyle={styles.textContainer}
          flagButtonStyle={styles.flagButton}
          codeTextStyle={styles.codeText}
          textInputStyle={styles.textInput}
        />
      </View>

      {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: mvs(14),
    marginBottom: mvs(6),
    fontWeight: '500',
  },
  phoneInputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: mvs(8),
    marginBottom: mvs(16),
    overflow: 'hidden',
  },
  errorContainer: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  phoneInputInnerContainer: {
    width: '100%',
    height: mvs(40),
    backgroundColor: colors.gray,
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  flagButton: {
    backgroundColor: 'transparent',
    paddingLeft: mvs(12),
  },
  codeText: {
    fontSize: mvs(16),
    color: colors.black,
  },
  textInput: {
    fontSize: mvs(16),
    color: colors.black,
    paddingVertical: mvs(12),
    paddingRight: mvs(12),
  },
  errorText: {
    color: 'red',
    marginBottom: mvs(5),
    fontSize: mvs(12),
    marginLeft: mvs(2),
  },
});

export default PhoneNumberInput;
