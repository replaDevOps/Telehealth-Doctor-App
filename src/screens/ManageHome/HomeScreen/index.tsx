import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert, Platform, PermissionsAndroid, RefreshControl, Modal, ActivityIndicator, Text } from 'react-native';
import StatsRow from '../../../components/molecules/StatsRow';

import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import { doctor } from '@assets/images';
import { ConsultationRequest } from '@components/molecules';
import HomeHeader from '@components/molecules/HomeHeadder';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';
import ConsultationRequestModal from '@components/molecules/Organisms/ConsultationRequestModal';
import { updateOnlineStatus } from '../../../services/api/dashboardService';

import { useDashboardStore, useProfileStore, useNotificationStore, useConsultationRequestStore, useAuthStore } from '../../../store';
import { useNotificationCount } from '../../../hooks/useNotificationCount';
import { acceptConsultation } from '../../../services/api/chatConsultationService';
import { Toast } from 'toastify-react-native';

export const HomeScreen = ({ navigation }) => {
  const { profileData } = useProfileStore();
  const { stats, recentConsultations, fetchDashboardData, isLoading } = useDashboardStore();
  const { fetchNotifications } = useNotificationStore();
  const { notificationCount } = useNotificationCount();
  const { requests: consultationRequests, removeRequest, clearAll: clearAllRequests } = useConsultationRequestStore();
  
  const [isActive, setIsActive] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);


useEffect(() => {
console.log('HomeScreen render', consultationRequests)
})
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications(); // Fetch notifications on mount
    requestPermissions(); // Request media permissions
  }, [fetchDashboardData, fetchNotifications]);

  // Initialize isActive state based on profile online_status
  useEffect(() => {
    if (profileData) {
      setIsActive(!!profileData.online_status);
    }
  }, [profileData]);

  // Clear requests when doctor goes offline
  useEffect(() => {
    if (!isActive) {
      clearAllRequests();
    }
  }, [isActive, clearAllRequests]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access for video consultations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const audioGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for audio and video consultations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        console.log('📱 [Permissions] Camera:', cameraGranted);
        console.log('📱 [Permissions] Audio:', audioGranted);

        setHasAudioPermission(audioGranted === PermissionsAndroid.RESULTS.GRANTED);
        setHasVideoPermission(
          cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
          audioGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('📱 [Permissions] Error requesting permissions:', err);
        setHasAudioPermission(false);
        setHasVideoPermission(false);
      }
    } else {
      // iOS permissions are handled at runtime by the system
      setHasAudioPermission(true);
      setHasVideoPermission(true);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      console.log('Accepting consultation request:', requestId);
      // show connecting UI while we accept and prepare navigation
      setIsConnecting(true);

      // Call acceptConsultation API
      await acceptConsultation({ id: requestId });

      // Find the consultation request to get patient info and type
      const consultationRequest = consultationRequests.find(req => req.id === requestId);

      // Remove request from store
      removeRequest(requestId);

      // Refresh dashboard to show updated consultations
      fetchDashboardData();

      Toast.success('Consultation accepted successfully');

      // Wait a bit for toast to show, then navigate
      setTimeout(() => {
        // Get patientID from consultation request or from recent consultations after refresh
        const consultation = recentConsultations.find(cons => cons.id === requestId);
        const patientID = consultationRequest?.patientID || consultation?.patientID;
        const consultationType = consultationRequest?.consultationType || consultation?.type || 'chat';

        // Get user ID for WebRTC
        const { user } = useAuthStore.getState();
        const doctorID = user?.id;
        const userId = doctorID ? `doctor_${doctorID}` : `doctor_${Date.now()}`;

        const patientInfo = consultationRequest ? {
          id: patientID,
          name: consultationRequest.patientName,
          image: consultationRequest.patientImage,
          age: consultationRequest.patientAge ? String(consultationRequest.patientAge) : '',
          gender: consultationRequest.patientGender || '',
        } : (consultation ? {
          id: consultation.patientID,
          name: consultation.patientName,
          image: consultation.patientImage,
          age: consultation.age || '',
          gender: consultation.gender || '',
        } : null);

        // Navigate based on consultation type
        if (consultationType === 'audio') {
          console.log('🎤 [Doctor] Navigating to AudioConsultation with params:', {
            consultationId: `consultation_${requestId}`,
            userId: userId,
            isInitiator: false,
            patientInfo: patientInfo,
            patientID: patientID,
            recipientID: patientID,
          });
          setIsConnecting(false);
          navigation.navigate('AudioConsultation', {
            consultationId: `consultation_${requestId}`,
            userId: userId,
            isInitiator: false, // Doctor joins, patient initiates
            patientInfo: patientInfo,
            patientID: patientID, // Pass patientID directly for consultation end API
            recipientID: patientID, // Alias for consistency
          });
        } else if (consultationType === 'video') {
          console.log('📹 [Doctor] Navigating to VideoConsultation with params:', {
            consultationId: `consultation_${requestId}`,
            userId: userId,
            isInitiator: false,
            patientInfo: patientInfo,
            patientID: patientID,
            recipientID: patientID,
          });
          setIsConnecting(false);
          navigation.navigate('VideoConsultation', {
            consultationId: `consultation_${requestId}`,
            userId: userId,
            isInitiator: false, // Doctor joins, patient initiates
            patientInfo: patientInfo,
            patientID: patientID, // Pass patientID directly for consultation end API
            recipientID: patientID, // Alias for consistency
          });
        } else {
          // Default to ChatScreen for chat consultations
          setIsConnecting(false);
          navigation.navigate('ChatScreen', {
            id: requestId,
            consultationId: requestId,
            patientID: patientID,
            patientInfo: patientInfo,
            chatType: 'doctor',
            fromHistory: false,
          });
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error accepting consultation:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to accept consultation';
      Toast.error(errorMessage);
      setIsConnecting(false);
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining consultation request:', requestId);
    // Remove request from store
    removeRequest(requestId);
  };

  const handleToggleActive = async (value: boolean) => {
    try {
      // Optimistically update UI
      setIsActive(value);

      // Call API to update online status
      await updateOnlineStatus(value);

      if (!value) {
        // Clear requests when going offline
        clearAllRequests();
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get clinic name from profile data or use default
  const clinicName = profileData?.clinic?.clinicName ||
    profileData?.clinic?.business_setting?.businessName ||
    'Medical Center';

  // Get location/address from clinic business_setting or use default
  // Combine address, city, and district if available
  const getLocation = (): string => {
    const businessSetting = profileData?.clinic?.business_setting;
    if (!businessSetting) return 'Location';

    const parts: string[] = [];
    if (businessSetting.address) parts.push(businessSetting.address);
    // if (businessSetting.city) parts.push(businessSetting.city);
    // if (businessSetting.district) parts.push(businessSetting.district);
    return parts.length > 0 ? parts.join(', ') : 'Location';
  };

  const location = getLocation();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        centerName={clinicName}
        location={location}
        doctorName={profileData?.name || ''}
        doctorSpecialty={profileData?.specialization || 'Dermatologist'}
        doctorImage={profileData?.image ? { uri: profileData.image } : doctor}
        isActive={isActive}
        onToggleActive={handleToggleActive}
        onNotificationPress={() => navigation.navigate('NotificationScreen')}
        onLocationPress={() => console.log('Location pressed')}
        notificationCount={notificationCount}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={isLoading && !refreshing ? styles.loadingContentContainer : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Stats Row */}
        <StatsRow
          totalConsultations={stats?.totalConsultations || 0}
          thisMonth={stats?.thisMonthTotalConsultations || 0}
        />

        {/* Recent Consultations */}
        <RecentConsultations
          consultations={recentConsultations}
          isLoading={isLoading}
          hideLoader={refreshing}
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
              patientInfo: consultation
                ? {
                  id: consultation.patientID,
                  name: consultation.patientName,
                  image: consultation.patientImage,
                }
                : null,
              chatType: 'doctor',
              fromHistory: true,
            });
          }}
        />
      </ScrollView>

      {/* Consultation Request Modal - Shows when requests are available from Pusher */}
      <ConsultationRequestModal
        visible={consultationRequests.length > 0 && isActive}
        requests={consultationRequests}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
        onClose={() => clearAllRequests()}
      />
      <Modal transparent visible={isConnecting} animationType="fade">
        <View style={styles.connectingModal}>
          <View style={styles.connectingModalContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.connectingText}>Connecting with patient, please wait...</Text>
          </View>
        </View>
      </Modal>
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
  loadingContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingModalContent: {
    width: '80%',
    backgroundColor: colors.white,
    padding: mvs(20),
    borderRadius: mvs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    marginTop: mvs(12),
    color: colors.primaryText,
    fontSize: mvs(14),
    textAlign: 'center',
  },
});

export default HomeScreen;
