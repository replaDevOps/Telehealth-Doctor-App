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
  handleImagePick: () => void; // For doctor: opens prescription modal
  canSendMessages: boolean;
  showAddButton?: boolean; // Show/hide the plus button
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSend,
  handleImagePick,
  canSendMessages,
  showAddButton = true,
}) => {
  if (!canSendMessages) {
    return null;
  }

  return (
    <View style={styles.inputContainer}>
      {showAddButton && (
        <TouchableOpacity style={styles.preButton} onPress={handleImagePick}>
          <Ionicons name="add-sharp" size={24} color={colors.white} />
        </TouchableOpacity>
      )}
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
