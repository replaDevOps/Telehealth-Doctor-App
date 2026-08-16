import React from 'react';
import {
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { colors } from '../../../styles/colors';
import { INPUT_BAR_PADDING, styles } from './style';

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
  const insets = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();

  // The bar keeps clear of the home indicator while the keyboard is down, and gives
  // that space back as it opens so it sits flush on top of the keyboard. Driven by
  // the keyboard's own progress value so it tracks the open/close animation exactly
  // instead of snapping a frame late.
  const safeAreaStyle = useAnimatedStyle(
    () => ({
      paddingBottom: INPUT_BAR_PADDING + insets.bottom * (1 - progress.value),
    }),
    [insets.bottom],
  );

  if (!canSendMessages) {
    return null;
  }

  return (
    <Animated.View style={[styles.inputContainer, safeAreaStyle]}>
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
    </Animated.View>
  );
};
