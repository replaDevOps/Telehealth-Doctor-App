import React, { useState, useEffect, useCallback } from 'react';
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
import { colors } from '../../../styles/colors';
import { patient } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { styles } from './style';
import PrescriptionBottomSheet from '@components/molecules/PrescriptionBottomSheet';
import usePrescriptionStore from '@store/usePrescriptionStore';
import { AIChatHistoryBottomSheet } from '@components/molecules/AIChatHistoryBottomSheet';
import { Service } from '../../../types/chat.types';
import { FloatingActionButton } from '@components/molecules';

export function VideoConsultation({ navigation, route }) {
  const patientInfo = route?.params?.patientInfo || {
    name: 'Dr. Yasmin Chowdhury',
    avatar: patient,
    specialization: 'Dermatologist',
  };

  const [callStatus, setCallStatus] = useState('Connecting....');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [aiHistoryVisible, setAiHistoryVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailVisible, setServiceDetailVisible] = useState(false);

  const writePrescription = usePrescriptionStore(
    state => state.writePrescription,
  );
  const resetPrescription = usePrescriptionStore(
    state => state.resetPrescription,
  );

  useEffect(() => {
    return () => {
      console.log(
        'VideoConsultation unmounting - resetting prescription state',
      );
      resetPrescription();
    };
  }, []);

  useEffect(() => {
    console.log('Prescription status:', writePrescription);
  }, [writePrescription]);

  const closePrescription = () => setVisible(false);

  const handleGetPrescription = () => {
    setModalVisible(false);
    setVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('Connected');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval;
    if (callStatus === 'Connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setModalVisible(true);
    if (writePrescription) {
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const switchCamera = () => {
    console.log('Switch camera');
  };

  const showPrescriptionModal = () => {
    setVisible(true);
  };

  const showAIChat = () => {
    setAiHistoryVisible(true);
  };

  const handleServicePress = useCallback((service: Service) => {
    setAiHistoryVisible(false);
    setSelectedService(service);
    setServiceDetailVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={patientInfo.avatar}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topSection}>
            <Text style={styles.patientName}>{patientInfo.name}</Text>
            <Text style={styles.callStatus}>
              {callStatus === 'Connected'
                ? formatDuration(callDuration)
                : callStatus}
            </Text>
          </View>

          {callStatus === 'Connected' && (
            <View style={styles.pipContainer}>
              <Image
                source={patientInfo.avatar}
                style={styles.pipImage}
                resizeMode="cover"
              />
            </View>
          )}

          <View style={styles.controlsContainer}>
            {/* FAB Component */}
            <FloatingActionButton
              onPrescriptionPress={showPrescriptionModal}
              onAIChatPress={showAIChat}
            />

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
          writePrescription={writePrescription}
        />
        <PrescriptionBottomSheet
          visible={visible}
          onClose={closePrescription}
        />
        <AIChatHistoryBottomSheet
          visible={aiHistoryVisible}
          onClose={() => setAiHistoryVisible(false)}
          handleServicePress={handleServicePress}
        />
      </ImageBackground>
    </View>
  );
}
