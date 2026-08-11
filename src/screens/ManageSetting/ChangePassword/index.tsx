import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Toast } from 'toastify-react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { Header2 } from '../../../components/common/Header2';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { changePassword } from '../../../services/api';

export const ChangePassword = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    api?: string;
  }>({});

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field] || errors.api) {
      setErrors(prev => ({ ...prev, [field]: undefined, api: undefined }));
    }
  };

  const validateFields = () => {
    const validationErrors: typeof errors = {};

    if (!oldPassword.trim()) {
      validationErrors.oldPassword = t('changePassword.oldPasswordRequired');
    }

    if (!newPassword.trim()) {
      validationErrors.newPassword = t('changePassword.newPasswordRequired');
    } else {
      // Validate password (min 8 chars, at least one number and one special character)
      const pwdRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (!pwdRegex.test(newPassword)) {
        validationErrors.newPassword = t('changePassword.passwordCriteria');
      }
    }

    if (!confirmPassword.trim()) {
      validationErrors.confirmPassword = t('changePassword.retypePasswordRequired');
    }

    if (
      newPassword.trim() &&
      confirmPassword.trim() &&
      newPassword !== confirmPassword
    ) {
      validationErrors.confirmPassword = t('changePassword.passwordsDoNotMatch');
    }

    if (Object.keys(validationErrors).length) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      return false;
    }

    setErrors({});
    return true;
  };

const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    console.log('Handle save triggered');
    const isValid = validateFields();
    console.log('Validation result:', isValid, errors);
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      // Show toast on success
      Toast.success(t('changePassword.passwordChangedSuccess'));
      navigation.goBack();
    } catch (err: any) {
      console.error('Change password error:', err);
      const apiError =
        err?.response?.data?.message ||
        err?.message ||
        t('changePassword.passwordChangeFailed');
      // Show API error as toast
      Toast.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title={t('settings.password')} useSave={true} handleSave={handleSave} saveLoading={loading} saveDisabled={loading} />

        <View style={styles.container}>
          <View style={styles.InputContainer}>
            <CustomTextInput
              label={t('changePassword.oldPassword')}
              placeholder={t('changePassword.enterOldPassword')}
              value={oldPassword}
              onChangeText={text => {
                setOldPassword(text);
                clearFieldError('oldPassword');
              }}
              secureTextEntry={true}
              errorMessage={errors.oldPassword}
            />
            <CustomTextInput
              label={t('changePassword.newPassword')}
              placeholder={t('changePassword.enterNewPassword')}
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                clearFieldError('newPassword');
              }}
              secureTextEntry={true}
              errorMessage={errors.newPassword}
            />
            <CustomTextInput
              label={t('changePassword.retypePassword')}
              placeholder={t('changePassword.retypeNewPassword')}
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                clearFieldError('confirmPassword');
              }}
              errorMessage={errors.confirmPassword}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};

