import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import StatsRow from '../../../components/molecules/StatsRow';

import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { doctor, RecommandImage } from '@assets/images';
import { ConsultationRequest } from '@components/molecules';
import HomeHeader from '@components/molecules/HomeHeadder';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';
import ConsultationRequestModal from '@components/molecules/Organisms/ConsultationRequestModal';
import { CONSULTATION_REQUESTS } from '@constants';

export const HomeScreen = ({ navigation }) => {
  const [isActive, setIsActive] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [consultationRequests, setConsultationRequests] = useState<
    ConsultationRequest[]
  >([]);

  // Simulate incoming consultation requests when doctor is active
  useEffect(() => {
    if (isActive) {
      // Simulate incoming request after 3 seconds
      const timer = setTimeout(() => {
        const mockRequests: ConsultationRequest[] = [
          {
            id: 'req-1',
            patientName: 'Patient 1',
            patientAge: 21,
            patientImage: doctor,

            patientGender: 'Female',
            consultationType: 'chat',
            treatmentType: 'Acne Treatment',
          },
          {
            id: 'req-2',
            patientName: 'Patient 2',
            patientAge: 21,
            patientImage: doctor,

            patientGender: 'Female',
            consultationType: 'audio',
            treatmentType: 'Acne Treatment',
          },
        ];
        setConsultationRequests(mockRequests);
        setShowRequestModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Close modal and clear requests when doctor goes offline
      setShowRequestModal(false);
      setConsultationRequests([]);
    }
  }, [isActive]);

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting request:', requestId);

    // Remove the accepted request from the list
    setConsultationRequests(prev => prev.filter(req => req.id !== requestId));

    // If no more requests, close modal
    if (consultationRequests.length === 1) {
      setShowRequestModal(false);
    }

    // Navigate to consultation screen
    const request = consultationRequests.find(req => req.id === requestId);
    if (request) {
      switch (request.consultationType) {
        case 'video':
          navigation.navigate('VideoCall', { requestId });
          break;
        case 'audio':
          navigation.navigate('AudioCall', { requestId });
          break;
        case 'chat':
          navigation.navigate('ChatScreen', {
            chatType: 'doctor',
            doctorInfo: {
              id: 'doctor_1',
              name: 'Dr. Sultan Khan',
              avatar: 'https://i.pravatar.cc/150?img=12',
            },
            clinicInfo: {
              name: 'Eden Medical Center',
              location: 'Makkah, Saudi Arabia, 2.2km',
              image: RecommandImage,
            },
          });
          break;
      }
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining request:', requestId);

    // Remove the declined request from the list
    setConsultationRequests(prev => prev.filter(req => req.id !== requestId));

    // If no more requests, close modal
    if (consultationRequests.length === 1) {
      setShowRequestModal(false);
    }
  };

  const handleToggleActive = (value: boolean) => {
    setIsActive(value);

    // Optionally call API to update doctor availability
    // updateDoctorAvailability(value);

    if (!value) {
      // Close modal when going offline
      setShowRequestModal(false);
      setConsultationRequests([]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        centerName="Eden Medical Center"
        location="Makkah"
        doctorName="Dr. Sultan Khan"
        doctorSpecialty="Dermatologist"
        doctorImage={doctor}
        isActive={isActive}
        onToggleActive={handleToggleActive}
        onNotificationPress={() => console.log('Notifications pressed')}
        onLocationPress={() => console.log('Location pressed')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <StatsRow totalConsultations={142} thisMonth={28} />

        {/* Recent Consultations */}
        <RecentConsultations
          consultations={CONSULTATION_REQUESTS}
          onViewAll={() => navigation.navigate('History')}
          onViewPrescription={id => {
            console.log('View prescription:', id);
            navigation.navigate('PrescriptionDetail', { id });
          }}
          onViewChat={id => {
            console.log('View chat:', id);
            navigation.navigate('ChatScreen', { id });
          }}
        />
      </ScrollView>

      {/* Consultation Request Modal */}
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
