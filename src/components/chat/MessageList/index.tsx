
import React, { useEffect } from 'react';
import { ScrollView, Keyboard, Platform } from 'react-native';
import { Message } from '../Message';
import { Message as MessageType, Service } from '../../../types/chat.types';
import { styles } from './style';

interface MessageListProps {
  messages: MessageType[];
  scrollRef: React.RefObject<ScrollView>;
  showAvatar: boolean;
  handleServicePress: (service: Service) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, scrollRef, showAvatar, handleServicePress }) => {
  // Auto-scroll to bottom when keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [scrollRef]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {messages.map((msg, index) => (
        <Message key={msg.id || `msg-${index}`} msg={msg} showAvatar={showAvatar} handleServicePress={handleServicePress} />
      ))}
    </ScrollView>
  );
};
