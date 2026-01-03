import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceDetailBottomSheet } from '@components/molecules';
import { styles } from './style';
import { patient } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  ChatHeader,
  MessageInput,
  MessageList,
} from '../../../components/chat';
import {
  DEFAULT_DOCTOR_INFO,
  CONSULTATION_DURATION,
  getCurrentTimestamp,
  formatTime,
} from '../../../constants/appData';
import { Message, Service } from '../../../types/chat.types';
import { getConsultationMessages, sendMessage as sendMessageAPI, ChatMessage } from '../../../services/api/chatConsultationService';
import { useAuthStore } from '../../../store';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from 'toastify-react-native';
import { pusherService } from '../../../services/pusher/PusherService';

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  // Extract route params with defaults
  const consultationId = route?.params?.id || route?.params?.consultationId;
  const chatType = route?.params?.chatType || (consultationId ? 'doctor' : 'ai');
  const fromHistory = route?.params?.fromHistory || false;
  const doctorInfo = route?.params?.doctorInfo || DEFAULT_DOCTOR_INFO;
  const patientInfo = route?.params?.patientInfo || null;

  // ---------- State ----------
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    CONSULTATION_DURATION,
  );
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'doctor' && !fromHistory,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuthStore();
  const doctorID = user?.id;

  const consultationTime = useMemo(
    () => formatTime(remainingSeconds),
    [remainingSeconds],
  );

  const showAvatar = chatType === 'doctor';
  const canSendMessages = !fromHistory;

  // Transform API messages to Message format
  const transformApiMessages = useCallback((apiMessages: ChatMessage[]): Message[] => {
    if (!Array.isArray(apiMessages)) return [];

    return apiMessages.map((apiMsg: ChatMessage) => {
      const isDoctorMessage = apiMsg.senderID === user?.id || apiMsg.senderID === user?.doctorID;
      
      return {
        id: String(apiMsg.id || Date.now()),
        type: isDoctorMessage ? 'user' : 'bot',
        text: apiMsg.message || '',
        timestamp: apiMsg.created_at || getCurrentTimestamp(),
        user: isDoctorMessage 
          ? { 
              name: user?.name || doctorInfo.name, 
              avatar: doctorInfo.avatar 
            }
          : patientInfo 
            ? { 
                name: patientInfo.name || 'Patient', 
                avatar: patientInfo.image || patient 
              }
            : undefined,
        images: apiMsg.file ? [{ uri: apiMsg.file }] : undefined,
      };
    });
  }, [user, doctorInfo, patientInfo]);

  // Fetch consultation messages
  const fetchMessages = useCallback(async () => {
    if (!consultationId) {
      // No consultation ID, set empty array to show empty state
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    try {
      const response = await getConsultationMessages(consultationId);
      const apiMessages = response.data || response || [];
      
      if (Array.isArray(apiMessages) && apiMessages.length > 0) {
        const transformedMessages = transformApiMessages(apiMessages);
        setMessages(transformedMessages);
      } else {
        // No messages yet, set empty array to show empty state
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      Toast.error(error?.message || 'Failed to load messages');
      // Set empty array on error to show empty state
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [consultationId, transformApiMessages]);

  // ---------- Lifecycle ----------
  // Fetch messages when screen is focused or consultation ID changes
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  // Timer for doctor consultation
  useEffect(() => {
    if (chatType !== 'doctor' || !isConsultationActive) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsConsultationActive(false);
          setModalVisible(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConsultationActive, chatType]);

  // Auto-scroll when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // Setup Pusher listeners for real-time messages
  useEffect(() => {
    if (!doctorID || !consultationId || chatType !== 'doctor') {
      return;
    }

    let isMounted = true;

    // Initialize Pusher
    pusherService.initialize();

    // Subscribe to sender channel (when doctor sends a message)
    const senderChannelName = `send-message${doctorID}`;
    const receiverChannelName = `received-message${doctorID}`;

    // Handler for message-sent event (confirmation that message was sent)
    const handleMessageSent = (data: any) => {
      console.log('Message sent alert:', data);
      if (!isMounted) return;
      // If the message is for this consultation, refresh messages
      if (data?.consultationID === consultationId || data?.consultation_id === consultationId) {
        // Optionally refresh messages or update UI
        fetchMessages();
      }
    };

    // Handler for message-received event (new message received)
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
      if (!isMounted) return;
      // If the message is for this consultation, add it to messages
      if (data?.consultationID === consultationId || data?.consultation_id === consultationId) {
        // Map the received message to Message format
        const isDoctorMessage = data?.senderID === doctorID || 
                               data?.senderType === 'doctor' ||
                               data?.senderRole === 'doctor';

        const newMessage: Message = {
          id: String(data?.id || data?.messageID || Date.now()),
          type: isDoctorMessage ? 'user' : 'bot',
          text: data?.message || data?.text || data?.content || '',
          timestamp: data?.created_at || data?.timestamp || data?.createdAt || getCurrentTimestamp(),
          user: isDoctorMessage
            ? { 
                name: user?.name || doctorInfo.name, 
                avatar: doctorInfo.avatar 
              }
            : patientInfo
            ? { 
                name: patientInfo.name || 'Patient', 
                avatar: patientInfo.image ? { uri: patientInfo.image } : patient 
              }
            : undefined,
          images: (() => {
            const imagePath = data?.file || data?.image || data?.fileUrl;
            if (!imagePath) return undefined;
            
            const fullImageUri = imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('file://')
              ? `https://telehealth.repla-projects.com/${imagePath}`
              : imagePath;
            
            return [{ uri: fullImageUri }];
          })(),
        };

        // Add message to state if it doesn't already exist
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    };

    // Bind events
    try {
      pusherService.bind(senderChannelName, 'message-sent', handleMessageSent);
    } catch (err) {
      console.error('Error binding to sender channel:', err);
    }
    
    try {
      pusherService.bind(receiverChannelName, 'message-received', handleMessageReceived);
    } catch (err) {
      console.error('Error binding to receiver channel:', err);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      pusherService.unbind(senderChannelName, 'message-sent');
      pusherService.unbind(receiverChannelName, 'message-received');
      try {
        pusherService.unsubscribe(senderChannelName);
      } catch (err) {
        console.error('Error unsubscribing from sender channel:', err);
      }
      try {
        pusherService.unsubscribe(receiverChannelName);
      } catch (err) {
        console.error('Error unsubscribing from receiver channel:', err);
      }
    };
  }, [doctorID, consultationId, chatType, user, doctorInfo, patientInfo, fetchMessages]);

  // ---------- Handlers ----------
  const handleImagePick = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          return;
        }

        if (response.errorCode) {
          console.error('Image Picker Error:', response.errorMessage);
          return;
        }

        const asset = response.assets?.[0];
        if (!asset?.uri) {
          console.error('No image URI found');
          return;
        }

        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          text: '',
          timestamp: getCurrentTimestamp(),
          user: showAvatar
            ? { name: 'Bassil Kuncill Saadeh', avatar: patient }
            : undefined,
          images: [{ uri: asset.uri }],
        };

        setMessages(prev => [...prev, newMessage]);
      },
    );
  }, [showAvatar]);

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (!consultationId) {
      // No consultation ID, just add to local state
      const newMsg: Message = {
        id: Date.now().toString(),
        type: 'user',
        text: trimmedMessage,
        timestamp: getCurrentTimestamp(),
        user: showAvatar
          ? { name: user?.name || doctorInfo.name, avatar: doctorInfo.avatar }
          : undefined,
      };

      setMessages(prev => [...prev, newMsg]);
      setMessage('');
      return;
    }

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      type: 'user',
      text: trimmedMessage,
      timestamp: getCurrentTimestamp(),
      user: showAvatar
        ? { name: user?.name || doctorInfo.name, avatar: doctorInfo.avatar }
        : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Send to API
    try {
      const patientId = patientInfo?.id || route?.params?.patientID;
      if (!patientId) {
        throw new Error('Patient ID not found');
      }

      await sendMessageAPI({
        recipientID: patientId,
        consultationID: consultationId,
        message: trimmedMessage,
      });

      // Refresh messages to get the actual message from server
      await fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      Toast.error(error?.message || 'Failed to send message');
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  }, [message, showAvatar, consultationId, user, doctorInfo, patientInfo, route, fetchMessages]);

  const handleServicePress = useCallback((service: Service) => {
    setSelectedService(service);
    setServiceDetailVisible(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    setServiceDetailVisible(false);
    navigation.navigate('CartScreen');
  }, [navigation]);

  const handleCheckout = useCallback(() => {
    setServiceDetailVisible(false);
    navigation.navigate('CheckoutScreen');
  }, [navigation]);

  const handleEndConsultation = useCallback(() => {
    setIsConsultationActive(false);
    setModalVisible(true);
  }, []);

  const handleGetPrescription = useCallback(() => {
    setModalVisible(false);
    navigation.navigate('PrescriptionScreen');
  }, [navigation]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ---------- Main Render ----------
  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        chatType={chatType}
        doctorInfo={doctorInfo}
        consultationTime={consultationTime}
        fromHistory={fromHistory}
        handleGoBack={handleGoBack}
        handleEndConsultation={handleEndConsultation}
      />

      {/* Messages */}
      {isLoadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7625D7" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : messages.length > 0 ? (
        <MessageList
          messages={messages}
          scrollRef={scrollRef}
          showAvatar={showAvatar}
          handleServicePress={handleServicePress}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyMessage}>
            {consultationId 
              ? 'Start the conversation by sending a message to the patient.'
              : 'Start the conversation by sending a message.'}
          </Text>
        </View>
      )}

      {/* Input - Only show if not viewing history */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        handleImagePick={handleImagePick}
        canSendMessages={canSendMessages}
      />

      {/* Modals */}
      <ServiceDetailBottomSheet
        visible={serviceDetailVisible}
        onClose={() => setServiceDetailVisible(false)}
        service={selectedService}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
      />
      <ConsultationEndedModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onGetPrescription={handleGetPrescription}
      />
    </SafeAreaView>
  );
}
