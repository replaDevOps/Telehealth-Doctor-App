import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import ConsultationRequestCard, {
  ConsultationType,
} from '../../molecules/ConsultationRequestCard';
import { mvs } from '../../../config/metrices';

export interface ConsultationRequest {
  id: string;
  patientName: string;
  patientImage?: any;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  consultationType: ConsultationType;
  treatmentType?: string;
}

interface ConsultationRequestModalProps {
  visible: boolean;
  requests: ConsultationRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onClose: () => void;
}

const ConsultationRequestModal = ({
  visible,
  requests,
  onAccept,
  onDecline,
  onClose,
}: ConsultationRequestModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    console.log('Modal visible:', visible);
    console.log('Requests:', requests);

    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, requests]);

  if (!visible || requests.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="rgba(0, 0, 0, 0.7)"
      />
      <View style={styles.modalContainer}>
        {/* Blurred Overlay Background */}
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />

        {/* Content Container */}
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {requests.map(request => (
              <View key={request.id} style={styles.cardWrapper}>
                <ConsultationRequestCard
                  patientName={request.patientName}
                  patientImage={request.patientImage}
                  patientAge={request.patientAge}
                  patientGender={request.patientGender}
                  consultationType={request.consultationType}
                  treatmentType={request.treatmentType}
                  onAccept={() => onAccept(request.id)}
                  onDecline={() => onDecline(request.id)}
                />
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(20),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  contentWrapper: {
    width: '100%',
    maxHeight: '80%',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: mvs(10),
  },
  cardWrapper: {
    marginBottom: mvs(16),
  },
});

export default ConsultationRequestModal;
