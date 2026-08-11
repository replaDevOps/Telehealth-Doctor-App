import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { styles } from './style';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSend: () => void;
  canSendMessages: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSend,
  canSendMessages,
}) => {
  const { t } = useTranslation();
  if (!canSendMessages) {
    return null;
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={colors.secondaryText}
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton]}
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Ionicons name="send" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};
