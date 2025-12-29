import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { KeyboardAvoidScrollview } from '../../../components/common/keyboard-avoid-scrollview';
import { Header2 } from '../../../components/common/Header2';
import { CustomTextInput } from '../../../components/common/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { changePassword } from '../../../services/api';

export const ChangePassword = ({ navigation }: { navigation: any }) => {
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    } catch (err: any) {
      console.error('Change password error:', err);
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to change password');
    }
  };

  return (
    <KeyboardAvoidScrollview>
      <SafeAreaView style={{ flex: 1 }}>
        <Header2 title="Password" useSave={true} handleSave={handleSave} />

        <View style={styles.container}>
          <View style={styles.InputContainer}>
            <CustomTextInput
              label="Old Password"
              placeholder="Enter old password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={true}
              errorMessage={error}
            />
            <CustomTextInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              errorMessage={error}
            />
            <CustomTextInput
              label="Re-Type Password"
              placeholder="Re-Type New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              errorMessage={error}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidScrollview>
  );
};

