import React from 'react';
import { ScrollView } from 'react-native';
import { Message } from '../Message';
import { Service } from '../../../types/chat.types';
import { styles } from './style';

interface MessageListProps {
  messages: any;
  scrollRef: React.RefObject<ScrollView | null>;
  handleServicePress: (service: Service) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  scrollRef,
  handleServicePress,
}) => {
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((msg, index) => (
        <Message
          key={msg.id || `msg-${index}`}
          msg={msg}
          handleServicePress={handleServicePress}
        />
      ))}
    </ScrollView>
  );
};
