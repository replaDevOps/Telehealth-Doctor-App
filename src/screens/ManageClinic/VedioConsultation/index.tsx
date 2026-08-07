import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RTCView } from 'react-native-webrtc';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { PrescriptionBottomSheet } from '@components/molecules';
import Avatar, { resolveAvatarSource } from '@components/common/Avatar';
import { styles } from './style';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Toast } from 'toastify-react-native';
import { endConsultation } from '@services/api/webrtcService';
import { pusherService } from '@services/pusher/PusherService';
import { useAuthStore } from '@store';
import { addPrescription } from '@services/api/chatConsultationService';
import { useBackgroundTimer } from '../../../hooks/useBackgroundTimer';

export function VideoConsultation({ navigation, route }) {
  const patientInfo = route?.params?.patientInfo || route?.params?.doctorInfo || {
    name: 'Patient',
    specialization: 'Patient',
  };

  // Null when the patient has no picture — the initials avatar is shown instead.
  const patientImageSource = useMemo<ImageSourcePropType | null>(() => {
    const prioritizedSources = [
      patientInfo?.avatar,
      patientInfo?.image,
      patientInfo?.profileImage,
      patientInfo?.profile_image,
      patientInfo?.imageUrl,
      patientInfo?.imageURL,
    ];

    for (const source of prioritizedSources) {
      const parsed = resolveAvatarSource(source);
      if (parsed) {
        return parsed;
      }
    }

    return null;
  }, [patientInfo]);

  // Get consultation parameters from route
  const consultationId = route?.params?.consultationId || `consultation_${Date.now()}`;
  const userId = route?.params?.userId || `doctor_${Date.now()}`;
  const isInitiator = route?.params?.isInitiator ?? false; // Doctor typically joins, not initiates
  const recipientID = route?.params?.recipientID; // Patient ID for doctor

  const [callDuration, setCallDuration] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [prescriptionBottomSheetVisible, setPrescriptionBottomSheetVisible] = useState(false);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const CONSULTATION_MAX_DURATION = 30 * 60; // 30 minutes in seconds (1800 seconds)
  const consultationStartTimeRef = useRef<number | null>(null);
  const consultationEndedRef = useRef(false);
  const handleEndCallRef = useRef<(() => void) | undefined>(undefined);
  const { user } = useAuthStore();
  const doctorID = user?.id;
  
  // Extract patientID from route params - this should be passed when navigating to consultation
  const patientID = route?.params?.patientID || route?.params?.patientInfo?.id;

  // Extract consultation ID from consultationId (format: "consultation_2" -> 2)
  const consultationID = useMemo(() => {
    if (!consultationId) return null;
    const match = consultationId.toString().match(/consultation_(\d+)/);
    return match ? Number(match[1]) : Number(consultationId);
  }, [consultationId]);

  const aiChatConsultationId =
    route?.params?.aiChatConsultationId ||
    route?.params?.aiConsultationId ||
    route?.params?.aiHistoryId ||
    route?.params?.aiChatId;

  // Construct consultationData from patientInfo for PrescriptionBottomSheet
  const consultationData = useMemo(() => {
    if (!patientInfo) return null;
    return {
      patient: {
        name: patientInfo.name || 'Patient',
        age: patientInfo.age || patientInfo.patientAge || '',
        gender: patientInfo.gender || patientInfo.patientGender || '',
        id: patientInfo.id || patientID,
      },
    };
  }, [patientInfo, patientID]);

  // Initialize WebRTC for video call
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isMuted,
    isVideoOff,
    isReady,
    isSpeakerOn,
    error,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    startCall,
    endCall,
    joinCall,
  } = useWebRTC({
    userId,
    roomId: consultationId,
    isVideoEnabled: true,
    isAudioEnabled: true,
  });

  const handleGetPrescription = () => {
    setModalVisible(false);
    console.log('User wants to get the prescription');
    navigation.navigate('PrescriptionScreen');
  };

  const handleAddPrescription = useCallback(() => {
    // Don't allow adding prescription if already added
    if (hasPrescription) {
      Toast.info('Prescription has already been added for this consultation');
      return;
    }
    setIsActionMenuOpen(false);
    setModalVisible(false);
    setTimeout(() => {
      setPrescriptionBottomSheetVisible(true);
    }, 100);
  }, [hasPrescription]);

  const toggleActionMenu = useCallback(() => {
    setIsActionMenuOpen(prev => !prev);
  }, []);

  const handleViewAiChatHistory = useCallback(() => {
    setIsActionMenuOpen(false);
    const historyId = aiChatConsultationId || consultationID;

    if (historyId) {
      const normalizedId = historyId.toString();
      navigation.navigate('ChatScreen', {
        chatType: 'ai',
        fromHistory: true,
        consultationId: normalizedId,
        id: normalizedId,
        patientInfo,
        patientID,
      });
      return;
    }

    navigation.navigate('ChatScreen', {
      chatType: 'ai',
      fromHistory: true,
      patientInfo,
      patientID,
    });
  }, [aiChatConsultationId, consultationID, navigation, patientInfo, patientID]);

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
      setHasPrescription(true);
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
    if (isReady) {
      const initCall = async () => {
        try {
          if (isInitiator) {
            await startCall();
          } else {
            await joinCall();
          }
        } catch (err) {
          console.error('Error initializing call:', err);
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

  useEffect(() => {
    if (!isConnected && isActionMenuOpen) {
      setIsActionMenuOpen(false);
    }
  }, [isConnected, isActionMenuOpen]);

  // Start call duration timer when connected
  useEffect(() => {
    let interval;
    if (isConnected) {
      // Track start time
      if (!consultationStartTimeRef.current) {
        consultationStartTimeRef.current = Date.now();
        console.log('📞 [VideoConsultation] Call connected, tracking duration');
      }
      
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  // Listen for consultation-end event from other side
  useEffect(() => {
    if (!consultationID || consultationEndedRef.current) return;

    pusherService.initialize();
    const pusher = pusherService.getInstance();
    if (!pusher) return;

    const channelName = `webrtc-consultation${consultationID}`;
    console.log('📞 [VideoConsultation] Listening for consultation-end on channel:', channelName);

    const handleConsultationEnd = (eventPayload: any) => {
      console.log('📞 [VideoConsultation] Consultation end event received (raw):', JSON.stringify(eventPayload, null, 2));
      if (consultationEndedRef.current) return;

      // Handle nested data structure: { data: { consultationID: ... } } or direct { consultationID: ... }
      let data = eventPayload;
      if (eventPayload?.data && typeof eventPayload.data === 'object') {
        data = eventPayload.data;
        console.log('📞 [VideoConsultation] Using nested data structure');
      }

      const eventConsultationID = data?.consultationID || data?.id || eventPayload?.consultationID || eventPayload?.id;
      const fromUser = (data?.from || eventPayload?.from || '').toString();
      
      // Check if this event is from the other side (patient), not from ourselves (doctor)
      const isFromDoctor = fromUser && fromUser.startsWith('doctor_');
      if (isFromDoctor) {
        console.log('📞 [VideoConsultation] Ignoring own event from:', fromUser);
        return;
      }
      
      const eventIDStr = eventConsultationID?.toString() || '';
      const consultationIDStr = consultationID?.toString() || '';
      
      if (eventIDStr && consultationIDStr && eventIDStr === consultationIDStr) {
        console.log('✅ [VideoConsultation] Consultation ended by patient, showing modal');
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

  const handleEndCall = useCallback(async () => {
    if (consultationEndedRef.current) return;
    consultationEndedRef.current = true;

    console.log('📞 [VideoConsultation] handleEndCall called, showing modal first');
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
          console.log('📞 [VideoConsultation] Ending consultation and notifying other side:', {
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

          console.log('✅ [VideoConsultation] Consultation ended successfully, other side notified');
        } else {
          console.warn('⚠️ [VideoConsultation] Missing user IDs, skipping API call:', { fromUserId, toUserId });
        }
      } catch (error: any) {
        console.error('❌ [VideoConsultation] Error ending consultation:', error);
        Toast.error(error?.response?.data?.message || 'Failed to end consultation');
      }
    } else {
      console.warn('⚠️ [VideoConsultation] Missing consultation data:', { consultationID, doctorID, recipientID, patientID, actualRecipientID, hasStartTime: !!consultationStartTimeRef.current });
    }

    // End call locally after showing modal and making API call
    // Use setTimeout to ensure modal renders first before ending call
    setTimeout(() => {
      console.log('📞 [VideoConsultation] Calling endCall() after modal is shown');
      endCall();
    }, 300);
  }, [consultationID, doctorID, recipientID, patientID, endCall]);

  // Keep handleEndCallRef updated with latest handleEndCall
  useEffect(() => {
    handleEndCallRef.current = handleEndCall;
  }, [handleEndCall]);

  // Use background-aware timer for 30-minute countdown
  const { remainingSeconds, formattedTime } = useBackgroundTimer({
    totalDuration: CONSULTATION_MAX_DURATION,
    isActive: isConnected,
    onTimeUpRef: handleEndCallRef,
  });

  // Determine call status - show countdown timer when connected
  const getCallStatus = () => {
    if (error && !isConnected) return 'Failed';
    if (isConnecting) return 'Connecting...';
    if (isConnected) {
      // Show countdown timer (remainingSeconds counts down from 30:00 to 00:00)
      return formattedTime;
    }
    return 'Connecting...';
  };

  const shouldShowActionMenu = !isInitiator && isConnected;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full Screen Remote Video or Placeholder */}
      {remoteStream ? (
        <>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.backgroundImage}
            objectFit="cover"
            mirror={false}
          />
          {/* Dark Overlay for better text visibility */}
          <View style={styles.overlay} />
        </>
      ) : patientImageSource ? (
        <ImageBackground
          source={patientImageSource}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
      ) : (
        <View style={[styles.darkBackground, styles.darkBackgroundCenter]}>
          <View style={styles.overlay} />
          <Avatar
            name={patientInfo?.name}
            size={mvs(140)}
            fontSize={mvs(52)}
            backgroundColor="rgba(255, 255, 255, 0.15)"
            textColor={colors.white}
          />
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
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
          </View>

          {/* Small Local Video (Picture-in-Picture) - Only when connected */}
          {isConnected && localStream && !isVideoOff && (
            <View style={styles.pipContainer}>
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.pipImage}
                objectFit="cover"
                mirror={true}
              />
            </View>
          )}

          {/* Floating Action Menu - Rendered outside controls for proper touch handling */}
          {shouldShowActionMenu && isActionMenuOpen && (
            <View style={styles.floatingActionMenu}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleViewAiChatHistory}
                activeOpacity={0.75}
              >
                <View style={styles.actionLabelBubble}>
                  <Text style={styles.actionLabelText}>View AI Chat History</Text>
                </View>
                <View style={styles.actionCircle}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={18}
                    color={colors.white}
                  />
                </View>
              </TouchableOpacity>
              {/* {!hasPrescription ? (
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleAddPrescription}
                  activeOpacity={0.75}
                >
                  <View style={styles.actionLabelBubble}>
                    <Text style={styles.actionLabelText}>Write Prescription</Text>
                  </View>
                  <View style={styles.actionCircle}>
                    <Ionicons
                      name="add"
                      size={20}
                      color={colors.white}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={[styles.actionRow, styles.actionRowDisabled]}>
                  <View style={styles.actionLabelBubble}>
                    <Text style={[styles.actionLabelText, styles.actionLabelTextDisabled]}>
                      Prescription Sent
                    </Text>
                  </View>
                  <View
                    style={[styles.actionCircle, styles.actionCircleSecondary]}
                  >
                    <Ionicons
                      name="checkmark-done"
                      size={18}
                      color={colors.white}
                    />
                  </View>
                </View>
              )} */}
            </View>
          )}

          {/* Call Controls at Bottom */}
          <View style={styles.controlsContainer}>
            {shouldShowActionMenu && (
              <TouchableOpacity
                style={[styles.moreButton, isActionMenuOpen && styles.moreButtonActive]}
                onPress={toggleActionMenu}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isActionMenuOpen ? 'close' : 'ellipsis-vertical'}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>
            )}
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
                size={24}
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
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* Camera Toggle Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isVideoOff && styles.controlButtonActive,
              ]}
              onPress={toggleVideo}
            >
              <Ionicons
                name={!isVideoOff ? 'videocam' : 'videocam-off'}
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* Switch Camera Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={switchCamera}
            >
              <MaterialCommunityIcons
                name="camera-flip"
                size={24}
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
        hasPrescription={hasPrescription}
        onAddPrescription={!hasPrescription ? handleAddPrescription : undefined}
        onEndConsultation={undefined} // No "End Consultation" button since call is already ended
      />
      <PrescriptionBottomSheet
        visible={prescriptionBottomSheetVisible}
        onClose={() => setPrescriptionBottomSheetVisible(false)}
        onSave={handleSavePrescription}
        consultationID={consultationID ? String(consultationID) : ''}
        consultationData={consultationData}
      />
    </View>
  );
}
