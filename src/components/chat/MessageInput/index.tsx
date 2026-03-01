import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  if (!canSendMessages) {
    return null;
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Message"
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
