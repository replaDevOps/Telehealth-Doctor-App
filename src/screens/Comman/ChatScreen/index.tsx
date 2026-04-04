import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { View, Text, ActivityIndicator, ScrollView, BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ServiceDetailBottomSheet, PrescriptionBottomSheet } from '@components/molecules';
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
  formatTimestampToLocal,
} from '../../../constants/appData';
import { Message, Service } from '../../../types/chat.types';
import { getConsultationMessages, sendMessage as sendMessageAPI, ChatMessage, addPrescription } from '../../../services/api/chatConsultationService';
import { useAuthStore, useProfileStore } from '../../../store';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from 'toastify-react-native';
import { pusherService } from '../../../services/pusher/PusherService';
import { endConsultation } from '../../../services/api/webrtcService';
import { useBackgroundTimer } from '../../../hooks/useBackgroundTimer';

// ---------- Main Component ----------
export function ChatScreen({ navigation, route }) {
  // Extract route params with defaults
  const consultationId = route?.params?.id || route?.params?.consultationId;
  const chatType = route?.params?.chatType || (consultationId ? 'doctor' : 'ai');
  const fromHistory = route?.params?.fromHistory || false;
  const doctorInfo = route?.params?.doctorInfo || DEFAULT_DOCTOR_INFO;
  const patientInfo = route?.params?.patientInfo || null;
  const patientID = route?.params?.patientID; // Extract patientID from route params

  // ---------- State ----------
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);
  const [isConsultationActive, setIsConsultationActive] = useState(
    chatType === 'doctor' && !fromHistory,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [consultationData, setConsultationData] = useState<any>(null);
  const [prescriptionBottomSheetVisible, setPrescriptionBottomSheetVisible] = useState(false);
  const [endConsultationModalVisible, setEndConsultationModalVisible] = useState(false);
  const [consultationWasEnded, setConsultationWasEnded] = useState(false); // Track if consultation was ended (use state for re-renders)

  const scrollRef = useRef<ScrollView>(null);
  const consultationStartTimeRef = useRef<number | null>(null); // Track when consultation started
  const consultationEndedRef = useRef(false); // Prevent duplicate API calls
  const handleEndConsultationConfirmRef = useRef<(() => void) | undefined>(undefined); // Ref for background timer callback
  const prescriptionOpenedFromEndModalRef = useRef(false); // true only when opened from End modal; don't end chat when opened from plus button
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { profileData } = useProfileStore();
  const doctorID = user?.id;
  
  // Get profile image from store (prioritize profileData.image over user.avatar)
  const doctorProfileImage = profileData?.image || user?.avatar;
  const doctorProfileAvatar = doctorProfileImage 
    ? (doctorProfileImage.startsWith('http') 
        ? { uri: doctorProfileImage } 
        : { uri: `https://telehealth.repla-projects.com/${doctorProfileImage}` })
    : doctorInfo.avatar;
  
  // State to store patientID from consultation data
  const [consultationPatientID, setConsultationPatientID] = useState<string | number | undefined>(patientID);

  const showAvatar = chatType === 'doctor';
  const canSendMessages = !fromHistory;
  
  // Check if consultation has prescription
  const hasPrescription = useMemo(() => {
    return !!consultationData?.prescription || !!consultationData?.hasPrescription;
  }, [consultationData]);

  // Transform API messages to Message format
  const transformApiMessages = useCallback((apiMessages: ChatMessage[]): Message[] => {
    if (!Array.isArray(apiMessages)) return [];

    return apiMessages.map((apiMsg: ChatMessage) => {
      // Determine if message is from doctor by comparing senderID (use String to avoid number/string mismatch)
      const isDoctorMessage = String(apiMsg.senderID) === String(user?.id) ||
                             String(apiMsg.senderID) === String(doctorID);
      
      // Use sender/recipient info from API response if available
      const senderInfo = apiMsg.sender;
      const recipientInfo = apiMsg.recipient;
      
      return {
        id: String(apiMsg.id || Date.now()),
        type: isDoctorMessage ? 'user' : 'bot',
        text: apiMsg.message || '',
        timestamp: apiMsg.dateTime || apiMsg.created_at || getCurrentTimestamp(),
        user: isDoctorMessage 
          ? { 
              // Use sender info from API if available, otherwise fallback to user/doctorInfo
              name: senderInfo?.name || user?.name || doctorInfo.name, 
              avatar: senderInfo?.image ? { uri: senderInfo.image } : doctorInfo.avatar 
            }
          : { 
              // Use sender info from API if available (patient), otherwise fallback to patientInfo
              name: senderInfo?.name || patientInfo?.name || 'Patient', 
              avatar: senderInfo?.image ? { uri: senderInfo.image } : (patientInfo?.image || patient)
            },
        images: apiMsg.file ? [{ uri: apiMsg.file }] : undefined,
      };
    });
  }, [user, doctorInfo, patientInfo, doctorID]);

  // Fetch consultation messages
  const fetchMessages = useCallback(async (silent: boolean = false) => {
    if (!consultationId) {
      // No consultation ID, set empty array to show empty state
      setMessages([]);
      return;
    }

    if (!silent) {
      setIsLoadingMessages(true);
    }
    try {
      const response = await getConsultationMessages(consultationId);
      
      // Store consultation data for header display; preserve hasPrescription/prescription
      // so the plus button doesn't flicker when refetching after sending messages
      const incomingConsultation = response.consultation || (response.data && typeof response.data === 'object' && !Array.isArray(response.data) ? response.data : null);
      if (incomingConsultation) {
        setConsultationData((prev: any) => {
          const next = { ...incomingConsultation };
          // Never clear prescription once set (stops plus button from reappearing on refetch after sending messages)
          next.hasPrescription = !!(prev?.hasPrescription || incomingConsultation?.hasPrescription);
          next.prescription = prev?.prescription ?? incomingConsultation?.prescription;
          return next;
        });
      }
      
      // Extract patientID from consultation data if available
      // Response structure: { success: true, data: {...consultation}, messages: [...] }
      // The consultation data contains patientID
      const consultation = response.consultation || (response.data && typeof response.data === 'object' && !Array.isArray(response.data) ? response.data : null);
      if (consultation && consultation.patientID) {
        const extractedPatientID = consultation.patientID;
        if (!consultationPatientID || consultationPatientID !== extractedPatientID) {
          setConsultationPatientID(extractedPatientID);
          console.log('Extracted patientID from consultation data:', extractedPatientID);
        }
      }
      
      // Messages are in response.data (array) or response.messages
      const apiMessages = response.messages || (Array.isArray(response.data) ? response.data : []);
      
      if (Array.isArray(apiMessages) && apiMessages.length > 0) {
        const transformedMessages = transformApiMessages(apiMessages);
        setMessages(transformedMessages);
      } else {
        // No messages yet, set empty array to show empty state
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      if (!silent) {
        Toast.error(error?.message || 'Failed to load messages');
      }
      // Set empty array on error to show empty state
      setMessages([]);
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  }, [consultationId, transformApiMessages]);

  // ---------- Lifecycle ----------
  // Fetch messages when screen is focused or consultation ID changes
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages])
  );

  // Track consultation start time
  useEffect(() => {
    if (isConsultationActive && chatType === 'doctor' && consultationId && !consultationStartTimeRef.current) {
      consultationStartTimeRef.current = Date.now();
      console.log('📞 [ChatScreen] Consultation started, tracking duration');
    }
  }, [isConsultationActive, chatType, consultationId]);

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
      
      // Extract message from data.message if it exists (Pusher event structure)
      // Handle structure: {message: {consultationID: ...}}
      const messageData = data?.message || data;
      const messageConsultationID = 
        messageData?.consultationID || 
        data?.consultationID || 
        data?.consultation_id ||
        null;
      
      // Normalize IDs for comparison
      const normalizedMessageConsultationID = messageConsultationID ? String(messageConsultationID) : null;
      const normalizedConsultationId = consultationId ? String(consultationId) : null;
      
      // If the message is for this consultation, silently reload all messages
      if (normalizedMessageConsultationID && normalizedConsultationId && normalizedMessageConsultationID === normalizedConsultationId) {
        // Silently reload messages without showing loader
        fetchMessages(true);
      }
    };

    // Handler for message-received event (new message received)
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
      if (!isMounted) return;
      
      // Extract message from data.message if it exists (Pusher event structure)
      // Handle structure: {message: {consultationID: 35, ...}}
      const messageData = data?.message || data;
      
      // Extract consultationID - handle nested structure
      const messageConsultationID = 
        messageData?.consultationID || 
        data?.consultationID || 
        data?.consultation_id ||
        null;
      
      // Normalize IDs for comparison (convert to string)
      const normalizedMessageConsultationID = messageConsultationID ? String(messageConsultationID) : null;
      const normalizedConsultationId = consultationId ? String(consultationId) : null;
      
      console.log('Message received - consultationID:', normalizedMessageConsultationID, 'Current consultationId:', normalizedConsultationId);
      console.log('Message data:', JSON.stringify(messageData, null, 2));
      
      // If the message is for this consultation
      if (normalizedMessageConsultationID && normalizedConsultationId && normalizedMessageConsultationID === normalizedConsultationId) {
        // Transform and append the message directly from Pusher response
        if (messageData && messageData.id) {
          // Determine if message is from doctor based on senderID
          // Pusher event has senderID, not sender object
          const normalizedSenderID = messageData.senderID ? String(messageData.senderID) : null;
          const normalizedDoctorID = doctorID ? String(doctorID) : null;
          const normalizedUserID = user?.id ? String(user.id) : null;
          
          const isDoctorMessage = normalizedSenderID === normalizedDoctorID || 
                                 normalizedSenderID === normalizedUserID ||
                                 messageData.sender?.type === 'doctor';
          
          // Get sender info from Pusher event or fallback to consultation data
          const senderInfo = messageData.sender;
          const doctorData = consultationData?.doctor;
          const patientData = consultationData?.patient;
          
          const newMessage: Message = {
            id: String(messageData.id),
            type: isDoctorMessage ? 'user' : 'bot',
            text: messageData.message || '',
            timestamp: messageData.dateTime || messageData.created_at || getCurrentTimestamp(),
            user: isDoctorMessage 
              ? { 
                  // Use sender info from Pusher if available, otherwise use consultation data or fallback
                  name: senderInfo?.name || doctorData?.name || user?.name || doctorInfo.name, 
                  avatar: senderInfo?.image ? { uri: senderInfo.image } : (doctorData?.image ? { uri: doctorData.image } : doctorInfo.avatar)
                }
              : { 
                  // Use sender info from Pusher if available, otherwise use consultation data or fallback
                  name: senderInfo?.name || patientData?.name || patientInfo?.name || 'Patient', 
                  avatar: senderInfo?.image ? { uri: senderInfo.image } : (patientData?.image ? { uri: patientData.image } : (patientInfo?.image ? { uri: patientInfo.image } : patient))
                },
            images: (() => {
              const imagePath = messageData.file || messageData.image || messageData.fileUrl;
              if (!imagePath) return undefined;

              const fullImageUri = imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('file://')
                ? `https://telehealth.repla-projects.com/${imagePath}`
                : imagePath;

              return [{ uri: fullImageUri }];
            })(),
          };

          // Append message if it doesn't already exist
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping append:', newMessage.id);
              return prev;
            }
            console.log('Appending new message from Pusher:', newMessage.id);
            return [...prev, newMessage];
          });
        }
        
        // Also silently reload messages to ensure we have the latest state
        console.log('Calling fetchMessages(true) to refresh messages...');
        fetchMessages(true).catch(err => {
          console.error('Error in fetchMessages:', err);
        });
      } else {
        console.log('Consultation ID mismatch - not refreshing messages');
        console.log('Message consultationID:', normalizedMessageConsultationID, 'Current:', normalizedConsultationId);
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

    // Listen for consultation-end event
    const consultationEndChannelName = `webrtc-consultation${consultationId}`;
    console.log('📞 [ChatScreen] Subscribing to consultation-end channel:', consultationEndChannelName);
    
    const handleConsultationEnd = (eventPayload: any) => {
      console.log('📞 [ChatScreen] Consultation end event received (raw):', JSON.stringify(eventPayload, null, 2));
      console.log('📞 [ChatScreen] Event payload type:', typeof eventPayload, 'has data property:', !!eventPayload?.data);
      console.log('📞 [ChatScreen] Current state - isMounted:', isMounted, 'consultationEndedRef:', consultationEndedRef.current, 'consultationId:', consultationId, 'type:', typeof consultationId);
      
      if (!isMounted || consultationEndedRef.current) {
        console.log('📞 [ChatScreen] Ignoring event - isMounted:', isMounted, 'consultationEndedRef:', consultationEndedRef.current);
        return;
      }

      // Handle nested data structure: { data: { consultationID: ... } } or direct { consultationID: ... }
      // Try multiple ways to extract the data
      let data = eventPayload;
      if (eventPayload?.data && typeof eventPayload.data === 'object') {
        data = eventPayload.data;
        console.log('📞 [ChatScreen] Using nested data structure');
      } else {
        console.log('📞 [ChatScreen] Using direct payload');
      }
      
      const eventConsultationID = data?.consultationID || data?.id || eventPayload?.consultationID || eventPayload?.id;
      const fromUser = (data?.from || eventPayload?.from || '').toString();
      
      console.log('📞 [ChatScreen] Extracted - eventConsultationID:', eventConsultationID, 'type:', typeof eventConsultationID, 'fromUser:', fromUser, 'consultationId:', consultationId, 'type:', typeof consultationId);
      
      // Check if this event is from the other side (patient), not from ourselves (doctor)
      // If we (doctor) sent this event, ignore it
      const isFromDoctor = fromUser && fromUser.startsWith('doctor_');
      if (isFromDoctor) {
        console.log('📞 [ChatScreen] Ignoring own event from:', fromUser);
        return;
      }

      // Compare IDs - ensure both are converted to strings for reliable comparison
      const eventIDStr = eventConsultationID?.toString() || '';
      const consultationIDStr = consultationId?.toString() || '';
      const idsMatch = eventIDStr && consultationIDStr && eventIDStr === consultationIDStr;
      
      console.log('📞 [ChatScreen] ID comparison - eventIDStr:', eventIDStr, 'consultationIDStr:', consultationIDStr, 'match:', idsMatch);

      // If the other side (patient) ended the consultation, show the modal where doctor can add prescription
      if (idsMatch) {
        console.log('✅ [ChatScreen] Consultation ended by patient, showing modal with prescription option');
        consultationEndedRef.current = true;
        setIsConsultationActive(false);
        setConsultationWasEnded(true); // Use state to trigger re-render
        setModalVisible(false); // Close the simple ended modal
        setEndConsultationModalVisible(true); // Show modal where doctor can add prescription (without End button)
        Toast.info('Consultation ended by the patient. You can still add prescription.');
      } else {
        console.log('❌ [ChatScreen] Consultation ID mismatch - eventIDStr:', eventIDStr, 'consultationIDStr:', consultationIDStr);
      }
    };

    try {
      pusherService.bind(consultationEndChannelName, 'consultation-end', handleConsultationEnd);
      console.log('✅ [ChatScreen] Bound to consultation-end event');
    } catch (err) {
      console.error('Error binding to consultation-end channel:', err);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      pusherService.unbind(senderChannelName, 'message-sent');
      pusherService.unbind(receiverChannelName, 'message-received');
      pusherService.unbind(consultationEndChannelName, 'consultation-end');
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
      try {
        pusherService.unsubscribe(consultationEndChannelName);
      } catch (err) {
        console.error('Error unsubscribing from consultation-end channel:', err);
      }
    };
  }, [doctorID, consultationId, chatType, user, doctorInfo, patientInfo, fetchMessages, consultationData]);

  // ---------- Handlers ----------
  const handleImagePick = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      async response => {
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

        if (!consultationId) {
          // No consultation ID, just add to local state
          const newMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: '',
            timestamp: getCurrentTimestamp(),
            user: showAvatar
              ? { 
                  name: profileData?.name || user?.name || doctorInfo.name, 
                  avatar: doctorProfileAvatar 
                }
              : undefined,
            images: [{ uri: asset.uri }],
          };
          setMessages(prev => [...prev, newMessage]);
          return;
        }

        // Optimistically add message with uploading state
        const tempId = `temp-img-${Date.now()}`;
        const newMessage: Message = {
          id: tempId,
          type: 'user',
          text: '',
          timestamp: getCurrentTimestamp(),
          user: showAvatar
            ? { 
                name: profileData?.name || user?.name || doctorInfo.name, 
                avatar: doctorProfileAvatar 
              }
            : undefined,
          images: [{ uri: asset.uri, isUploading: true }],
        };

        setMessages(prev => [...prev, newMessage]);

        // Send image via API
        try {
          const patientId = consultationPatientID || patientID || patientInfo?.id || route?.params?.patientID;
          if (!patientId) {
            throw new Error('Patient ID not found');
          }

          await sendMessageAPI({
            recipientID: patientId,
            consultationID: consultationId,
            message: '',
            file: {
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'image.jpg',
            },
          });

          // Update message to remove uploading state
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? {
                    ...msg,
                    images: msg.images?.map(img => ({ ...img, isUploading: false })),
                  }
                : msg
            )
          );

          // Note: Pusher event (message-sent) will handle refreshing messages silently
          // No need to reload all messages here
        } catch (error: any) {
          console.error('Error sending image:', error);
          Toast.error(error?.message || 'Failed to send image');
          // Remove the optimistic message on error
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
      },
    );
  }, [showAvatar, consultationId, consultationPatientID, patientID, patientInfo, user, doctorInfo, route]);

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
        ? { 
            name: profileData?.name || user?.name || doctorInfo.name, 
            avatar: doctorProfileAvatar 
          }
        : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Send to API
    try {
      // Get patientID from multiple sources: state (from consultation data), route params, patientInfo
      const patientId = consultationPatientID || patientID || patientInfo?.id || route?.params?.patientID;
      if (!patientId) {
        console.warn('Patient ID not found. Available sources:', {
          consultationPatientID,
          patientID,
          patientInfoId: patientInfo?.id,
          routePatientID: route?.params?.patientID,
        });
        throw new Error('Patient ID not found. Please ensure consultation is properly loaded.');
      }

      const response = await sendMessageAPI({
        recipientID: patientId,
        consultationID: consultationId,
        message: trimmedMessage,
      });

      // Update message ID with API response if available
      // Don't reload all messages - Pusher event will handle the update
      const messageId = response?.id || response?.data?.id;
      if (messageId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: String(messageId),
                }
              : msg
          )
        );
      }
      // Note: Pusher event (message-sent) will handle refreshing messages silently
    } catch (error: any) {
      console.error('Error sending message:', error);
      Toast.error(error?.message || 'Failed to send message');
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  }, [message, showAvatar, consultationId, consultationPatientID, patientID, user, doctorInfo, patientInfo, route]);

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
    // Show options modal for doctor (Add Prescription or End Consultation)
    if (chatType === 'doctor' && !fromHistory) {
      setEndConsultationModalVisible(true);
    } else {
      setIsConsultationActive(false);
      setModalVisible(true);
    }
  }, [chatType, fromHistory]);

  // End modal: open prescription sheet; on save we will end the consultation
  const handleAddPrescriptionFromEndModal = useCallback(() => {
    if (hasPrescription) {
      Toast.info('Prescription has already been added for this consultation');
      return;
    }
    prescriptionOpenedFromEndModalRef.current = true;
    setEndConsultationModalVisible(false);
    setModalVisible(false);
    setPrescriptionBottomSheetVisible(true);
  }, [hasPrescription]);

  // Helper function to calculate duration
  const calculateDuration = useCallback(() => {
    if (!consultationStartTimeRef.current) return '0 min';
    const durationMs = Date.now() - consultationStartTimeRef.current;
    const durationMinutes = Math.floor(durationMs / 60000);
    return `${durationMinutes} min`;
  }, []);

  // Helper function to end consultation and notify the other side
  const endConsultationAndNotify = useCallback(async () => {
    if (consultationEndedRef.current || !consultationId || !isConsultationActive) {
      return;
    }

    consultationEndedRef.current = true;
    setConsultationWasEnded(true); // Use state to trigger re-render
    setIsConsultationActive(false);

    try {
      const duration = calculateDuration();
      // For doctor side: from = doctor_XX, to = patient_YY
      const fromUserId = `doctor_${doctorID}`;
      const toUserId = `patient_${consultationPatientID || patientID}`;

      if (!fromUserId || !toUserId || !consultationPatientID) {
        console.warn('⚠️ [ChatScreen] Missing user IDs, cannot notify other side:', { fromUserId, toUserId, doctorID, consultationPatientID, patientID });
        return;
      }

      console.log('📞 [ChatScreen] Ending consultation and notifying other side:', {
        consultationID: consultationId,
        duration,
        from: fromUserId,
        to: toUserId,
      });

      await endConsultation({
        consultationID: Number(consultationId),
        duration,
        from: fromUserId,
        to: toUserId,
        offer: { type: 'offer', sdp: '...' }, // Required by API
      });

      console.log('✅ [ChatScreen] Consultation ended successfully, other side notified');
    } catch (error: any) {
      console.error('❌ [ChatScreen] Error ending consultation:', error);
      // Still show modal even if API call fails
      Toast.error(error?.response?.data?.message || 'Failed to end consultation');
    }
  }, [consultationId, isConsultationActive, doctorID, consultationPatientID, patientID, calculateDuration]);

  const handleSavePrescription = useCallback(async (prescriptions: Array<{ name: string; description: string }>) => {
    if (!consultationId) {
      throw new Error('Consultation ID not found');
    }

    await addPrescription({
      consultationID: consultationId,
      prescriptions,
    });

    // Update consultationData to reflect that prescription has been added
    setConsultationData((prevData: any) => ({
      ...prevData,
      hasPrescription: true,
      prescription: prescriptions,
    }));

    Toast.success('Prescription added successfully');

    setPrescriptionBottomSheetVisible(false);

    // Only end the consultation when prescription was opened from the End modal (not from plus button)
    if (prescriptionOpenedFromEndModalRef.current) {
      prescriptionOpenedFromEndModalRef.current = false;
      await endConsultationAndNotify();
      setEndConsultationModalVisible(true);
    }
  }, [consultationId, endConsultationAndNotify]);

  const handleEndConsultationConfirm = useCallback(async () => {
    // Call API to notify other side (this sets consultationEndedRef.current = true and consultationWasEnded = true)
    await endConsultationAndNotify();
    
    // After ending consultation, the modal will automatically update to show only "Add Prescription" button
    // because consultationWasEnded state will be true, making onEndConsultation undefined
    // No need to close and reopen - just keep the modal open with updated props
    setIsConsultationActive(false);
  }, [endConsultationAndNotify]);

  // Keep ref updated for background timer callback
  useEffect(() => {
    handleEndConsultationConfirmRef.current = handleEndConsultationConfirm;
  }, [handleEndConsultationConfirm]);

  // Use background-aware timer for 30-minute countdown (works in background)
  const { remainingSeconds, formattedTime } = useBackgroundTimer({
    totalDuration: CONSULTATION_DURATION,
    isActive: chatType === 'doctor' && isConsultationActive,
    onTimeUpRef: handleEndConsultationConfirmRef,
  });

  // Memoized consultation time display
  const consultationTime = useMemo(
    () => formattedTime,
    [formattedTime],
  );

  const handleGetPrescription = useCallback(() => {
    setModalVisible(false);
    navigation.navigate('PrescriptionScreen');
  }, [navigation]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    navigation.goBack(); // Close chat and navigate back
  }, [navigation]);

  const handleGoBack = useCallback(() => {
    // Show confirmation dialog before going back
    if (chatType === 'doctor' && !fromHistory && isConsultationActive) {
      setEndConsultationModalVisible(true);
      return true; // Prevent default back action
    }
    navigation.goBack();
  }, [chatType, fromHistory, isConsultationActive, navigation]);

  // Override back button behavior
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (chatType === 'doctor' && !fromHistory && isConsultationActive) {
        handleGoBack();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, [chatType, fromHistory, isConsultationActive, handleGoBack]);

  // ---------- Main Render ----------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <SafeAreaView style={styles.container}>
      <ChatHeader
        chatType={chatType}
        doctorInfo={doctorInfo}
        doctorDisplayName={profileData?.name || user?.name || doctorInfo.name}
        consultationId={consultationId}
        consultationTime={consultationTime}
        fromHistory={fromHistory}
        handleGoBack={handleGoBack}
        handleEndConsultation={handleEndConsultation}
        isConsultationActive={isConsultationActive}
        consultationData={consultationData}
        patientInfo={patientInfo}
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
        isDoctor={true}
        hasPrescription={hasPrescription}
        onAddPrescription={!hasPrescription ? handleAddPrescriptionFromEndModal : undefined}
      />
      <ConsultationEndedModal
        visible={endConsultationModalVisible}
        onClose={() => {
          setEndConsultationModalVisible(false);
          // If consultation was ended, also close the chat
          if (consultationWasEnded && !isConsultationActive) {
            navigation.goBack();
          }
        }}
        onGetPrescription={handleGetPrescription}
        isDoctor={true}
        hasPrescription={hasPrescription}
        onAddPrescription={!hasPrescription ? handleAddPrescriptionFromEndModal : undefined}
        // Only show "End Consultation" button if consultation hasn't been ended yet
        // If consultationWasEnded is true, it means consultation was already ended, so hide the End button
        onEndConsultation={!consultationWasEnded ? handleEndConsultationConfirm : undefined}
      />
      <PrescriptionBottomSheet
        visible={prescriptionBottomSheetVisible}
        onClose={() => setPrescriptionBottomSheetVisible(false)}
        onSave={handleSavePrescription}
        consultationID={consultationId || ''}
        consultationData={consultationData}
      />
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
