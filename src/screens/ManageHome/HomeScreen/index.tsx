import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import StatsRow from '../../../components/molecules/StatsRow';

import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { doctor } from '@assets/images';
import { ConsultationRequest } from '@components/molecules';
import HomeHeader from '@components/molecules/HomeHeadder';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';
import ConsultationRequestModal from '@components/molecules/Organisms/ConsultationRequestModal';
import { updateOnlineStatus } from '../../../services/api/dashboardService';

import { useDashboardStore, useProfileStore, useNotificationStore } from '../../../store';

export const HomeScreen = ({ navigation }) => {
  const { profileData } = useProfileStore();
  const { stats, recentConsultations, fetchDashboardData, isLoading } = useDashboardStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  const [isActive, setIsActive] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [consultationRequests, setConsultationRequests] = useState<
    ConsultationRequest[]
  >([]);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications(); // Fetch notifications on mount
  }, [fetchDashboardData, fetchNotifications]);

  // Initialize isActive state based on profile status
  useEffect(() => {
    if (profileData?.status) {
      setIsActive(profileData.status === 'Active');
    }
  }, [profileData]);

  // Simulate incoming consultation requests when doctor is active
  useEffect(() => {
    if (isActive) {
      // (Keep existing simulation logic or remove it if not needed, for now I'll keep it)
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
        ];
        setConsultationRequests(mockRequests);
        setShowRequestModal(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowRequestModal(false);
      setConsultationRequests([]);
    }
  }, [isActive]);

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting request:', requestId);
    setConsultationRequests(prev => prev.filter(req => req.id !== requestId));
    if (consultationRequests.length === 1) {
      setShowRequestModal(false);
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining request:', requestId);
    setConsultationRequests(prev => prev.filter(req => req.id !== requestId));
    if (consultationRequests.length === 1) {
      setShowRequestModal(false);
    }
  };

  const handleToggleActive = async (value: boolean) => {
    try {
      // Optimistically update UI
      setIsActive(value);
      
      // Call API to update online status
      await updateOnlineStatus(value);
      
      if (!value) {
        // Close modal when going offline
        setShowRequestModal(false);
        setConsultationRequests([]);
      }
    } catch (error: any) {
      // Revert the toggle if API call fails
      setIsActive(!value);
      
      // Show error message
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update online status. Please try again.';
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        centerName="Eden Medical Center"
        location="Makkah"
        doctorName={profileData?.name || 'Dr. Sultan Khan'}
        doctorSpecialty={profileData?.specialization || 'Dermatologist'}
        doctorImage={profileData?.image ? { uri: profileData.image } : doctor}
        isActive={isActive}
        onToggleActive={handleToggleActive}
        onNotificationPress={() => navigation.navigate('NotificationScreen')}
        onLocationPress={() => console.log('Location pressed')}
        notificationCount={unreadCount}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <StatsRow
          totalConsultations={stats?.totalConsultations || 0}
          thisMonth={stats?.thisMonth || 0}
        />

        {/* Recent Consultations */}
        <RecentConsultations
          consultations={recentConsultations}
          isLoading={isLoading}
          onViewAll={() => navigation.navigate('History')}
          onViewPrescription={id => {
            console.log('View prescription:', id);
            navigation.navigate('PrescriptionDetail', { id });
          }}
          onViewChat={id => {
            console.log('View chat:', id);
            // Find the consultation data to pass patient info
            const consultation = recentConsultations.find(cons => cons.id === id);
            navigation.navigate('ChatScreen', { 
              id,
              consultationId: id,
              patientID: consultation?.patientID,
              patientInfo: consultation ? {
                id: consultation.patientID,
                name: consultation.patientName,
                image: consultation.patientImage,
              } : null,
              chatType: 'doctor',
              fromHistory: false,
            });
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
