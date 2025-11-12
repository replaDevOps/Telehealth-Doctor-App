import { Message } from '@components/chat';
import { getAIChatHistory } from '@constants';
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface AIChatHistoryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  handleServicePress: (service: any) => void;
  patientInfo: any; // Add this prop
}

const { height } = Dimensions.get('window');

export const AIChatHistoryBottomSheet: React.FC<
  AIChatHistoryBottomSheetProps
> = ({ visible, onClose, handleServicePress, patientInfo }) => {
  const scrollRef = useRef<ScrollView>(null);

  // FIX: Call the function to get the actual messages array
  const messages = getAIChatHistory(patientInfo);

  // Debug: Check if messages are loading
  useEffect(() => {
    if (visible) {
      console.log('Messages data:', messages);
      console.log('Messages length:', messages.length);
    }
  }, [visible, messages]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Chat With Vena AI</Text>
          </View>

          {/* Debug Info */}
          {messages.length === 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>No messages to display</Text>
              <Text style={styles.debugText}>Messages array is empty</Text>
            </View>
          )}

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && styles.emptyContent,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <Message
                  key={msg.id || `msg-${index}`}
                  msg={msg}
                  handleServicePress={handleServicePress}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No chat history available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  debugText: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 4,
  },
});
