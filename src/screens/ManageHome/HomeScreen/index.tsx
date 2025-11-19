import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import StatsRow from '../../../components/molecules/StatsRow';

import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { doctor, patient } from '@assets/images';
import { ConsultationRequest } from '@components/molecules';
import HomeHeader from '@components/molecules/HomeHeadder';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';
import ConsultationRequestModal from '@components/molecules/Organisms/ConsultationRequestModal';
import { CONSULTATION_REQUESTS } from '@constants';
import { useTranslation } from 'react-i18next';

export const HomeScreen = ({ navigation }) => {
  const [isActive, setIsActive] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [consultationRequests, setConsultationRequests] = useState<
    ConsultationRequest[]
  >([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        const mockRequests: ConsultationRequest[] = [
          {
            id: 'req-1',
            patientName: 'Patient 1',
            patientAge: 21,
            patientImage: patient,

            patientGender: 'Female',
            consultationType: 'chat',
            treatmentType: 'Acne Treatment',
          },
          {
            id: 'req-2',
            patientName: 'Patient 2',
            patientAge: 21,
            patientImage: patient,

            patientGender: 'Female',
            consultationType: 'audio',
            treatmentType: 'Acne Treatment',
          },
          {
            id: 'req-3',
            patientName: 'Patient 3',
            patientAge: 19,
            patientImage: patient,
            patientGender: 'Male',
            consultationType: 'video',
            treatmentType: 'Acne Treatment',
          },
        ];
        setConsultationRequests(mockRequests);
        setShowRequestModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowRequestModal(false);
      setConsultationRequests([]);
    }
  }, [isActive]);

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting request:', requestId);
    setShowRequestModal(false);

    setConsultationRequests(prev => prev.filter(req => req.id !== requestId));

    const request = consultationRequests.find(req => req.id === requestId);
    if (request) {
      switch (request.consultationType) {
        case 'video':
          navigation.navigate('VideoConsultation', {
            patientInfo: {
              name: 'Dr. Yasmin Chowdhury',
              avatar: doctor,
              specialization: 'Dermatologist',
            },
          });
          break;
        case 'audio':
          navigation.navigate('AudioConsultation', {
            patientInfo: {
              name: 'Dr. Yasmin Chowdhury',
              avatar: doctor,
              specialization: 'Dermatologist',
            },
          });
          break;
        case 'chat':
          navigation.navigate('ChatScreen', {
            chatType: 'patient',
            patientInfo: {
              id: 'patient_1',
              name: 'Patient Name',
              gender: 'Female',
              age: 21,
              avatar: patient,
            },
          });
          break;
      }
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining request:', requestId);

    setConsultationRequests(prev => prev.filter(req => req.id !== requestId));

    if (consultationRequests.length === 1) {
      setShowRequestModal(false);
    }
  };

  const handleToggleActive = (value: boolean) => {
    setIsActive(value);

    if (!value) {
      setShowRequestModal(false);
      setConsultationRequests([]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        centerName={t('eden_medical_center')}
        location={t('makkah')}
        patientName={t('dr_sultan_khan')}
        patientSpecialty={t('dermatologist')}
        patientImage={patient}
        isActive={isActive}
        onToggleActive={handleToggleActive}
        onNotificationPress={() => console.log('Notifications pressed')}
        onLocationPress={() => console.log('Location pressed')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatsRow totalConsultations={142} thisMonth={28} />

        <RecentConsultations
          consultations={CONSULTATION_REQUESTS}
          onViewAll={() => navigation.navigate('History')}
          onViewPrescription={id => {
            console.log('View prescription:', id);
            navigation.navigate('PrescriptionDetail', { id });
          }}
          onViewChat={id => {
            console.log('View chat:', id);
            navigation.navigate('ChatScreen', {
              chatType: 'patient',
              fromHistory: true,
              patientInfo: {
                id: 'patient_1',
                name: 'Patient Name',
                gender: 'Female',
                age: 21,
                avatar: patient,
              },
            });
          }}
        />
      </ScrollView>

      <ConsultationRequestModal
        visible={showRequestModal && consultationRequests.length > 0}
        requests={consultationRequests}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
        onClose={() => setShowRequestModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingVertical: mvs(20),
    paddingHorizontal: mvs(15),
  },
});

export default HomeScreen;
