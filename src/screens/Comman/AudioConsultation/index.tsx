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
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import AntDesign from 'react-native-vector-icons/AntDesign';

export function AudioConsultation({ navigation, route }) {
  const patientInfo = route?.params?.patientInfo || {
    name: 'Dr. Yasmin Chowdhury',
    avatar: patient,
    specialization: 'Dermatologist',
  };

  const [callStatus, setCallStatus] = useState('Connecting....');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const closePrescription = () => setVisible(false);

  // Get prescription state and reset function from Zustand
  const writePrescription = usePrescriptionStore(
    state => state.writePrescription,
  );
  const resetPrescription = usePrescriptionStore(
    state => state.resetPrescription,
  );

  // ✅ Reset prescription state when component unmounts
  useEffect(() => {
    return () => {
      // This cleanup function runs when component unmounts
      console.log(
        'VideoConsultation unmounting - resetting prescription state',
      );
      resetPrescription();
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

  // Optional: Log when writePrescription changes
  useEffect(() => {
    console.log('Prescription status:', writePrescription);
  }, [writePrescription]);

  const handleGetPrescription = () => {
    setModalVisible(false);
    setVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    // Simulate connecting to call
    const connectTimer = setTimeout(() => {
      setCallStatus('Connected');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    // Start call duration timer when connected
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
  const showprescriptionModal = () => {
    setVisible(true);
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
          {/* Doctor Info at Top */}
          <View style={styles.topSection}>
            <Text style={styles.patientName}>{patientInfo.name}</Text>
            <Text style={styles.callStatus}>
              {callStatus === 'Connected'
                ? formatDuration(callDuration)
                : callStatus}
            </Text>
          </View>

          {/* Call Controls at Bottom */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={showprescriptionModal}
            >
              <AntDesign name="plus" size={24} color={colors.white} />
            </TouchableOpacity>
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
          writePrescription={writePrescription}
        />
        <PrescriptionBottomSheet
          visible={visible}
          onClose={closePrescription}
        />
      </ImageBackground>
    </View>
  );
}

import { styles } from './style';
import PrescriptionBottomSheet from '@components/molecules/PrescriptionBottomSheet';
import usePrescriptionStore from '@store/usePrescriptionStore';
