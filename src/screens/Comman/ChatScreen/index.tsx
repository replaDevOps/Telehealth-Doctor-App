import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceDetailBottomSheet } from '@components/molecules';
import { styles } from './style';
import { doctor, patient } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import {
  ChatHeader,
  MessageInput,
  MessageList,
} from '../../../components/chat';
import {
  DEFAULT_PATIENT_INFO,
  CONSULTATION_DURATION,
  getCurrentTimestamp,
  formatTime,
  getInitialMessages,
} from '../../../constants/appData';
import { Message, Service } from '../../../types/chat.types';
import { AIChatHistoryBottomSheet } from '@components/molecules/AIChatHistoryBottomSheet';
import PrescriptionBottomSheet from '@components/molecules/PrescriptionBottomSheet';

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  // Extract route params with defaults
  const chatType = route?.params?.chatType || 'patient'; // 'patient' | 'ai'
  const fromHistory = route?.params?.fromHistory || false;
  const patientInfo = route?.params?.patientInfo || DEFAULT_PATIENT_INFO;

  // ---------- State ----------
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiChatHistory, setAiChatHistory] = useState<Message[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [aiHistoryVisible, setAiHistoryVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    CONSULTATION_DURATION,
  );
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'patient' && !fromHistory,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const openPrescription = () => setVisible(true);
  const closePrescription = () => setVisible(false);

  // ---------- Memoized Values ----------
  const initialMessages = useMemo(
    () => getInitialMessages(chatType, patientInfo),
    [chatType, patientInfo],
  );

  const consultationTime = useMemo(
    () => formatTime(remainingSeconds),
    [remainingSeconds],
  );

  const showAvatar = chatType === 'patient';
  const canSendMessages = !fromHistory;

  // Show "AI Chat History" button only when chatting with patient (not in AI mode)
  const showAIChatHistoryButton = chatType === 'patient';

  // ---------- Lifecycle ----------
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Load AI chat history when component mounts
  useEffect(() => {
    // TEMPORARY: Mock data for testing
    // Replace this with actual getAIChatHistory(patientInfo) from appData.ts
    const mockHistory: Message[] = [
      {
        id: 'ai-1',
        type: 'user',
        text: "I've uploaded a photo. I have some redness and itching on my face.",
        timestamp: getCurrentTimestamp(),
        images: [patient, patient], // Using patient image as placeholder
        user: {
          name: patientInfo.name,
          avatar: patientInfo.avatar,
        },
      },
      {
        id: 'ai-2',
        type: 'bot',
        text: "It seems like mild skin irritation. Based on your clinic's services, I'd recommend:",
        timestamp: getCurrentTimestamp(),
        user: {
          name: 'Vena AI',
          avatar: patient,
        },
        suggestions: [
          {
            id: 's1',
            image: patient, // Replace with PipsImage
            type: 'Service',
            serviceGroup: 'Acne Treatment',
            serviceName: 'Advanced Facial',
            price: '350 SAR',
            duration: '45 min',
            description: 'A multi-step facial treatment.',
            procedure: 'Uses patented device.',
          },
          {
            id: 's2',
            image: patient, // Replace with PipsImage
            type: 'Device',
            serviceGroup: 'Wood lamp',
            serviceName: 'Diagnostic',
            price: '600 SAR',
            duration: '1 hr',
            description: 'Advanced diagnostic.',
            procedure: 'Device for skin analysis.',
          },
        ],
      },
      {
        id: 'ai-3',
        type: 'bot',
        text: 'Suggest me devices related to my problem:',
        timestamp: getCurrentTimestamp(),
        user: {
          name: 'Vena AI',
          avatar: patient,
        },
        suggestions: [
          {
            id: 's3',
            image: patient,
            type: 'Service',
            serviceGroup: 'Functional (DO...)',
            serviceName: 'Fractional CO2...',
            price: '350 SAR',
            duration: '45 min',
            description: 'A multi-step facial treatment.',
            procedure: 'Uses patented device.',
          },
        ],
      },
    ];

    console.log('AI Chat History loaded, count:', mockHistory.length);
    setAiChatHistory(mockHistory);
  }, [patientInfo.avatar, patientInfo.name]);

  // Timer for patient consultation
  useEffect(() => {
    if (chatType !== 'patient' || !isConsultationActive) return;

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

  // ---------- Handlers ----------
  const handleImagePick = useCallback(() => {
    // TODO: Implement image picker
  }, []);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      type: 'doctor',
      text: trimmedMessage,
      timestamp: getCurrentTimestamp(),
      user: showAvatar ? { name: 'Doctor Name', avatar: doctor } : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // TODO: Integrate with actual chat API
    // simulateBotResponse(trimmedMessage);
  }, [message, showAvatar]);

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

  const handleAIChatHistory = useCallback(() => {
    console.log('Opening AI Chat History');
    console.log('aiChatHistory state:', aiChatHistory);
    console.log('aiChatHistory length:', aiChatHistory.length);
    setAiHistoryVisible(true);
  }, [aiChatHistory]);

  const handleCloseAIHistory = useCallback(() => {
    setAiHistoryVisible(false);
  }, []);

  // ---------- Main Render ----------
  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        patientInfo={patientInfo}
        consultationTime={consultationTime}
        fromHistory={fromHistory}
        handleGoBack={handleGoBack}
        handleEndConsultation={handleEndConsultation}
      />

      {/* Clinic/Patient Info */}
      <View style={styles.clinicInfo}>
        <View style={styles.clinicLeft}>
          <Image source={patientInfo.avatar} style={styles.clinicImage} />
          <View>
            <Text style={styles.clinicName}>{patientInfo.name}</Text>
            <Text style={styles.clinicLocation}>
              {patientInfo.gender + ', ' + patientInfo.age}
              {' Year Old'}
            </Text>
          </View>
        </View>

        {showAIChatHistoryButton && (
          <TouchableOpacity
            style={styles.consultButton}
            onPress={handleAIChatHistory}
          >
            <Text style={styles.consultButtonText}>AI Chat History</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <MessageList
        messages={messages}
        scrollRef={scrollRef}
        handleServicePress={handleServicePress}
      />

      {/* Input - Only show if not viewing history */}
      {canSendMessages && (
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
          canSendMessages={canSendMessages}
          handleImagePick={openPrescription}
        />
      )}

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
        writePrescription={true}
      />

      <AIChatHistoryBottomSheet
        visible={aiHistoryVisible}
        onClose={() => setAiHistoryVisible(false)}
        handleServicePress={service => {
          console.log('Service pressed:', service);
        }}
        patientInfo={patientInfo}
      />

      <PrescriptionBottomSheet visible={visible} onClose={closePrescription} />
    </SafeAreaView>
  );
}
