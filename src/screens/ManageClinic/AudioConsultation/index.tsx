import React, { useState, useEffect } from 'react';
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
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Toast } from 'toastify-react-native';
import { styles } from './style';

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
  const CONSULTATION_MAX_DURATION = 30 * 60; // 30 minutes in seconds
  const [remainingSeconds, setRemainingSeconds] = useState(CONSULTATION_MAX_DURATION);

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

  const handleClose = () => {
    setModalVisible(false);
    endCall();
    navigation.goBack();
  };

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
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
    setModalVisible(true);
  };

  // Auto-disconnect after 30 minutes (works for both patient and doctor)
  useEffect(() => {
    if (!isConnected) {
      // Reset timer when disconnected
      setRemainingSeconds(CONSULTATION_MAX_DURATION);
      return;
    }

    // Reset timer when call connects
    setRemainingSeconds(CONSULTATION_MAX_DURATION);

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('⏰ [AudioConsultation] 30 minutes elapsed, auto-ending call');
          // Auto-end the call and show modal
          endCall();
          setModalVisible(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, endCall]);


  // Determine call status
  const getCallStatus = () => {
    if (error && !isConnected) return 'Failed';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return formatDuration(callDuration);
    return 'Connecting...';
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full Screen Background Image */}
      <ImageBackground
        source={patientInfo.avatar}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <View style={styles.overlay} />
        {/* Content */}
        <SafeAreaView style={styles.safeArea}>
          {/* Patient Info at Top */}
          <View style={styles.topSection}>
            <Text style={styles.doctorName}>{patientInfo.name}</Text>
            <Text style={styles.callStatus}>
              {getCallStatus()}
            </Text>
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
        <ConsultationEndedModal
          visible={modalVisible}
          onClose={handleClose}
          onGetPrescription={handleGetPrescription}
        />
      </ImageBackground>
    </View>
  );
}
