import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RTCView } from 'react-native-webrtc';
import { colors } from '../../../styles/colors';
import { patient } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { styles } from './style';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Toast } from 'toastify-react-native';

export function VideoConsultation({ navigation, route }) {
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

  // Initialize WebRTC for video call
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isMuted,
    isVideoOff,
    isReady,
    error,
    toggleMute,
    toggleVideo,
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

  // Keep speaker state locally
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

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

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement native speaker toggle
  };

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
      ) : (
        <ImageBackground
          source={patientInfo.avatar}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
      )}

      {/* Content */}
      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <SafeAreaView style={styles.safeArea}>
          {/* Patient Info at Top */}
          <View style={styles.topSection}>
            <Text style={styles.doctorName}>{patientInfo.name}</Text>
            <Text style={styles.callStatus}>
              {getCallStatus()}
            </Text>
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
      />
    </View>
  );
}
