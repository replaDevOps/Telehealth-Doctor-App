import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { patient } from '@assets/images';
import { mvs } from '@config/metrices';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { PrescriptionBottomSheet } from '@components/molecules';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Toast } from 'toastify-react-native';
import { styles } from './style';
import { endConsultation } from '@services/api/webrtcService';
import { pusherService } from '@services/pusher/PusherService';
import { useAuthStore } from '@store';
import { addPrescription } from '@services/api/chatConsultationService';

export function AudioConsultation({ navigation, route }) {
  const patientInfo = route?.params?.patientInfo || route?.params?.doctorInfo || {
    name: 'Patient',
    avatar: patient,
    specialization: 'Patient',
  };

  // Get consultation parameters from route
  const consultationId = route?.params?.consultationId || `consultation_${Date.now()}`;
  const userId = route?.params?.userId || `doctor_${Date.now()}`;
  const isInitiator = route?.params?.isInitiator ?? false; // Doctor typically joins, not initiates

  const [callDuration, setCallDuration] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [prescriptionBottomSheetVisible, setPrescriptionBottomSheetVisible] = useState(false);
  const CONSULTATION_MAX_DURATION = 30 * 60; // 30 minutes in seconds (1800 seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(CONSULTATION_MAX_DURATION);
  const consultationStartTimeRef = useRef<number | null>(null);
  const consultationEndedRef = useRef(false);
  const timerInitializedRef = useRef(false);
  const { user } = useAuthStore();
  const doctorID = user?.id;
  const recipientID = route?.params?.recipientID; // Patient ID for doctor
  
  // Extract patientID from route params - this should be passed when navigating to consultation
  const patientID = route?.params?.patientID || route?.params?.patientInfo?.id;

  // Initialize WebRTC for audio-only call
  const {
    isConnected,
    isConnecting,
    isMuted,
    isReady,
    isSpeakerOn,
    error,
    toggleMute,
    toggleSpeaker,
    startCall,
    endCall,
    joinCall,
  } = useWebRTC({
    userId,
    roomId: consultationId,
    isVideoEnabled: false,
    isAudioEnabled: true,
  });

  const handleGetPrescription = () => {
    setModalVisible(false);
    console.log('User wants to get the prescription');
    navigation.navigate('PrescriptionScreen');
  };

  const handleAddPrescription = useCallback(() => {
    setPrescriptionBottomSheetVisible(true);
  }, []);

  const handleSavePrescription = useCallback(async (prescriptions: Array<{ name: string; description: string }>) => {
    if (!consultationID) {
      Toast.error('Consultation ID not found');
      return;
    }

    try {
      await addPrescription({
        consultationID: consultationID,
        prescriptions,
      });
      Toast.success('Prescription added successfully');
      setPrescriptionBottomSheetVisible(false);
    } catch (error: any) {
      console.error('Error adding prescription:', error);
      Toast.error(error?.response?.data?.message || 'Failed to add prescription');
    }
  }, [consultationID]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    // End call if not already ended
    endCall();
    navigation.goBack();
  }, [endCall, navigation]);

  // Start/join call when WebRTC is ready
  useEffect(() => {
    console.log('🎬 [AudioConsultation] Effect triggered:', { isReady, isInitiator });
    if (isReady) {
      const initCall = async () => {
        try {
          console.log('🎬 [AudioConsultation] Initializing call, isInitiator:', isInitiator);
          if (isInitiator) {
            console.log('📞 [AudioConsultation] Patient starting call... (isInitiator IS TRUE)');
            await startCall();
          } else {
            console.log('📞 [AudioConsultation] Doctor joining call...');
            await joinCall();
          }
        } catch (err) {
          console.error('❌ [AudioConsultation] Error initializing call:', err);
          Toast.error('Failed to connect to call');
        }
      };

      initCall();
    }
  }, [isReady, isInitiator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast.error(error);
    }
  }, [error]);

  // Start call duration timer when connected
  useEffect(() => {
    let interval;
    if (isConnected) {
      // Track start time
      if (!consultationStartTimeRef.current) {
        consultationStartTimeRef.current = Date.now();
        console.log('📞 [AudioConsultation] Call connected, tracking duration');
      }
      
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  // Extract consultation ID from consultationId (format: "consultation_2" -> 2)
  const consultationID = useMemo(() => {
    if (!consultationId) return null;
    const match = consultationId.toString().match(/consultation_(\d+)/);
    return match ? Number(match[1]) : Number(consultationId);
  }, [consultationId]);

  // Listen for consultation-end event from other side
  useEffect(() => {
    if (!consultationID || consultationEndedRef.current) return;

    pusherService.initialize();
    const pusher = pusherService.getInstance();
    if (!pusher) return;

    const channelName = `webrtc-consultation${consultationID}`;
    console.log('📞 [AudioConsultation] Listening for consultation-end on channel:', channelName);

    const handleConsultationEnd = (eventPayload: any) => {
      console.log('📞 [AudioConsultation] Consultation end event received (raw):', JSON.stringify(eventPayload, null, 2));
      if (consultationEndedRef.current) return;

      // Handle nested data structure: { data: { consultationID: ... } } or direct { consultationID: ... }
      let data = eventPayload;
      if (eventPayload?.data && typeof eventPayload.data === 'object') {
        data = eventPayload.data;
        console.log('📞 [AudioConsultation] Using nested data structure');
      }

      const eventConsultationID = data?.consultationID || data?.id || eventPayload?.consultationID || eventPayload?.id;
      const fromUser = (data?.from || eventPayload?.from || '').toString();
      
      // Check if this event is from the other side (patient), not from ourselves (doctor)
      const isFromDoctor = fromUser && fromUser.startsWith('doctor_');
      if (isFromDoctor) {
        console.log('📞 [AudioConsultation] Ignoring own event from:', fromUser);
        return;
      }
      
      const eventIDStr = eventConsultationID?.toString() || '';
      const consultationIDStr = consultationID?.toString() || '';
      
      if (eventIDStr && consultationIDStr && eventIDStr === consultationIDStr) {
        console.log('✅ [AudioConsultation] Consultation ended by patient, showing modal');
        consultationEndedRef.current = true;
        // Show modal first, then end call
        setModalVisible(true);
        // End the call locally after showing modal
        setTimeout(() => {
          endCall();
        }, 100);
      }
    };

    pusherService.bind(channelName, 'consultation-end', handleConsultationEnd);

    return () => {
      pusherService.unbind(channelName, 'consultation-end');
      pusherService.unsubscribe(channelName);
    };
  }, [consultationID]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = useCallback(async () => {
    if (consultationEndedRef.current) return;
    consultationEndedRef.current = true;

    console.log('📞 [AudioConsultation] handleEndCall called, showing modal first');
    // Show modal first before ending call to ensure it displays
    setModalVisible(true);

    // Calculate duration and notify the other side
    // Get recipient ID from multiple sources: recipientID, patientID, or patientInfo
    const actualRecipientID = recipientID || patientID;
    
    if (consultationID && consultationStartTimeRef.current && doctorID && actualRecipientID) {
      try {
        const durationMs = Date.now() - consultationStartTimeRef.current;
        const durationMinutes = Math.floor(durationMs / 60000);
        const duration = `${durationMinutes} min`;

        // For doctor: from = doctor_XX, to = patient_YY
        const fromUserId = `doctor_${doctorID}`;
        const toUserId = `patient_${actualRecipientID}`;

        if (fromUserId && toUserId && !toUserId.includes('undefined')) {
          console.log('📞 [AudioConsultation] Ending consultation and notifying other side:', {
            consultationID,
            duration,
            from: fromUserId,
            to: toUserId,
          });

          await endConsultation({
            consultationID,
            duration,
            from: fromUserId,
            to: toUserId,
            offer: { type: 'offer', sdp: '...' },
          });

          console.log('✅ [AudioConsultation] Consultation ended successfully, other side notified');
        } else {
          console.warn('⚠️ [AudioConsultation] Missing user IDs, skipping API call:', { fromUserId, toUserId });
        }
      } catch (error: any) {
        console.error('❌ [AudioConsultation] Error ending consultation:', error);
        Toast.error(error?.response?.data?.message || 'Failed to end consultation');
      }
    } else {
      console.warn('⚠️ [AudioConsultation] Missing consultation data:', { consultationID, doctorID, recipientID, patientID, actualRecipientID, hasStartTime: !!consultationStartTimeRef.current });
    }

    // End call locally after showing modal and making API call
    // Use setTimeout to ensure modal renders first before ending call
    setTimeout(() => {
      console.log('📞 [AudioConsultation] Calling endCall() after modal is shown');
      endCall();
    }, 300);
  }, [consultationID, doctorID, recipientID, patientID, endCall]);

  // Auto-disconnect after 30 minutes - countdown timer (works for both patient and doctor)
  useEffect(() => {
    if (!isConnected) {
      // Reset flags when disconnected
      timerInitializedRef.current = false;
      setRemainingSeconds(CONSULTATION_MAX_DURATION);
      return;
    }

    // Initialize timer once when call connects
    if (!timerInitializedRef.current) {
      timerInitializedRef.current = true;
      setRemainingSeconds(CONSULTATION_MAX_DURATION);
      console.log('⏰ [AudioConsultation] Starting 30-minute countdown timer');
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('⏰ [AudioConsultation] 30 minutes elapsed, auto-ending call');
          // Auto-end the call - this will call handleEndCall which shows modal
          handleEndCall();
          return 0;
        }
        return prev - 1; // Count down
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, handleEndCall]);


  // Determine call status - show countdown timer when connected
  const getCallStatus = () => {
    if (error && !isConnected) return 'Failed';
    if (isConnecting) return 'Connecting...';
    if (isConnected) {
      // Show countdown timer (remainingSeconds counts down from 30:00 to 00:00)
      return formatDuration(remainingSeconds);
    }
    return 'Connecting...';
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full Screen Background Image or Dark Background */}
      {patientInfo?.avatar && patientInfo.avatar !== null && patientInfo.avatar !== undefined ? (
        <ImageBackground
          source={patientInfo.avatar}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Dark Overlay */}
          <View style={styles.overlay} />
        </ImageBackground>
      ) : (
        <View style={styles.darkBackground}>
          {/* Dark Overlay */}
          <View style={styles.overlay} />
        </View>
      )}
      
      {/* Content - Positioned absolutely over background */}
      <View style={styles.contentContainer}>
        <SafeAreaView style={styles.safeArea}>
        {/* Patient Info at Top with Prescription Button */}
        <View style={styles.topSection}>
          {/* Centered Patient Info */}
          <View style={styles.patientInfoCenter}>
            <Text style={styles.doctorName}>{patientInfo.name}</Text>
            <Text style={styles.callStatus}>
              {getCallStatus()}
            </Text>
          </View>
          {/* Prescription Button - Positioned absolutely on the right */}
          {!isInitiator && isConnected && (
            <TouchableOpacity
              style={styles.prescriptionTopButton}
              onPress={handleAddPrescription}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Call Controls at Bottom */}
        <View style={styles.controlsContainer}>
          {/* Speaker Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive,
            ]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>

          {/* Mute Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Ionicons name="close" size={32} color={colors.white} />
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </View>
      
      <ConsultationEndedModal
        visible={modalVisible}
        onClose={handleClose}
        onGetPrescription={handleGetPrescription}
        isDoctor={true}
        onAddPrescription={handleAddPrescription}
        onEndConsultation={undefined} // No "End Consultation" button since call is already ended
      />
      <PrescriptionBottomSheet
        visible={prescriptionBottomSheetVisible}
        onClose={() => setPrescriptionBottomSheetVisible(false)}
        onSave={handleSavePrescription}
        consultationID={consultationID ? String(consultationID) : ''}
        consultationData={null}
      />
    </View>
  );
}
