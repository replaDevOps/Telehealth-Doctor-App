import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorMessage?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  // New props for character count
  maxLength?: number;
  showCharCount?: boolean; // Enable character counter
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  containerStyle,
  errorMessage,
  style,
  value = '',
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  maxLength,
  showCharCount = false, // default false
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!!secureTextEntry);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const currentLength = value.length;
  const isNearLimit = maxLength ? currentLength > maxLength * 0.9 : false;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, style]}>
        <TextInput
          style={[styles.input, { minHeight: multiline ? 100 : undefined }]}
          placeholder={placeholder}
          multiline={multiline}
          placeholderTextColor={colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          maxLength={maxLength}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={handleTogglePassword}
            disabled={props.editable === false}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={mvs(20)}
              color={colors.black}
            />
          </TouchableOpacity>
        )}
        {/* Character Counter - Only shown if showCharCount is true and maxLength exists */}
        {showCharCount && maxLength !== undefined && (
          <Text
            style={[
              styles.charCount,
              { color: isNearLimit ? colors.red : colors.secondaryText },
            ]}
          >
            {currentLength}/{maxLength}
          </Text>
        )}
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: mvs(16),
  },
  label: {
    fontSize: mvs(13),
    marginBottom: mvs(8),
    fontWeight: '500',
    color: colors.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: mvs(8),
    backgroundColor: colors.gray,
  },
  input: {
    flex: 1,
    paddingHorizontal: mvs(12),
    paddingVertical: mvs(12),
    fontSize: mvs(14),
    color: colors.black,
  },
  iconContainer: {
    paddingHorizontal: mvs(10),
  },
  errorText: {
    color: 'red',
    marginTop: mvs(5),
    fontSize: mvs(12),
  },
  charCount: {
    fontSize: mvs(12),
    marginTop: mvs(4),
    fontWeight: '500',
    position: 'absolute',
    bottom: mvs(4),
    right: mvs(4),
  },
});

export { CustomTextInput };
