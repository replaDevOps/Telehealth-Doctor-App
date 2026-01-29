import { useEffect, useRef } from 'react';
import { pusherService } from '../services/pusher/PusherService';
import { useAuthStore, useDashboardStore, useProfileStore } from '../store';
import { useNotificationStore } from '../store/useNotificationStore';
import { useConsultationRequestStore } from '../store/useConsultationRequestStore';
import { ConsultationRequest } from '../components/molecules/Organisms/ConsultationRequestModal';
import { Toast } from 'toastify-react-native';

/**
 * Hook to set up Pusher listeners for doctor notifications and consultations
 */
export const usePusherNotifications = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const doctorID = user?.id;
  const listenersSetRef = useRef(false);

  useEffect(() => {
    console.log('🔔 [usePusherNotifications] Effect triggered', {
      isLoading,
      isAuthenticated,
      doctorID,
      listenersSet: listenersSetRef.current,
    });

    // Wait for auth store to finish loading before checking authentication
    if (isLoading) {
      console.log('🔔 [usePusherNotifications] Auth store still loading, waiting...');
      return;
    }

    // Only proceed if user is authenticated and has an ID
    if (!isAuthenticated || !doctorID || listenersSetRef.current) {
      console.log('🔔 [usePusherNotifications] Skipping Pusher setup:', {
        isAuthenticated,
        doctorID,
        listenersSet: listenersSetRef.current,
      });
      return;
    }

    console.log('🔔 [usePusherNotifications] Setting up Pusher for doctor:', doctorID);

    // Initialize Pusher connection as soon as user is logged in
    console.log('🔔 [usePusherNotifications] Initializing Pusher...');
    pusherService.initialize();
    console.log('🔔 [usePusherNotifications] Pusher initialized, connection status:', pusherService.getConnectionStatus());

    // Doctor notification channel
    // Doctor notification channel
    const notificationChannelName = `send-notification-doctor${doctorID}`;
    const consultationChannelName = `doctor-consultation${doctorID}`;
    const sendMessageChannelName = `send-message${doctorID}`;
    const receiveMessageChannelName = `received-message${doctorID}`;

    // Handler for notification-send-doctor event
    const handleNotification = async (data: any) => {
      console.log('Doctor notification received:', data);

      // Refresh notifications from API
      try {
        const { refreshNotifications } = useNotificationStore.getState();
        await refreshNotifications();
        console.log('✅ Notifications refreshed after Pusher event');
      } catch (error) {
        console.error('❌ Error refreshing notifications:', error);
      }

      // Show toast notification - ensure we extract a string value
      let notificationMessage = 'New notification received';

      if (typeof data === 'string') {
        notificationMessage = data;
      } else if (data && typeof data === 'object') {
        // Extract string from various possible fields
        notificationMessage =
          data?.description ||
          data?.message ||
          data?.title ||
          data?.body ||
          data?.type ||
          (data?.notification ? (typeof data.notification === 'string' ? data.notification : data.notification?.description || data.notification?.message || data.notification?.title) : null) ||
          'New notification received';
      }
      console.log('Notification message to display:', notificationMessage);
      // Ensure it's a string, not an object
      if (typeof notificationMessage !== 'string') {
        notificationMessage = JSON.stringify(notificationMessage);
      }

      Toast.info(notificationMessage);
    };

    // Handler for consultation-doctor event
    const handleConsultationUpdate = (data: any) => {
      console.log('Consultation update received:', data);

      // Extract consultation data from Pusher event
      const consultation = data?.consultation || data;

      if (!consultation || !consultation.id) {
        console.warn('Invalid consultation data received:', data);
        return;
      }

      // Map consultation type (Chat/Video/Audio) to ConsultationType
      const consultationTypeMap: Record<string, ConsultationRequest['consultationType']> = {
        'Chat': 'chat',
        'Video': 'video',
        'Audio': 'audio',
        'chat': 'chat',
        'video': 'video',
        'audio': 'audio',
      };

      const consultationType = consultationTypeMap[consultation.type] || 'chat';

      // Try to get patient info from dashboard store (if consultation was already fetched)
      const { recentConsultations, allConsultations } = useDashboardStore.getState();
      const existingConsultation = [...recentConsultations, ...allConsultations].find(
        (cons: any) => String(cons.id) === String(consultation.id)
      );

      // Extract patient info from existing consultation or use placeholders
      const patientName = existingConsultation?.patientName ||
        (consultation.patient?.name) ||
        `Patient ${consultation.patientID}` ||
        'Patient';

      const patientAge = existingConsultation?.age ?
        parseInt(existingConsultation.age.replace(/\D/g, '')) || 25 : 25;

      const patientGender = (existingConsultation?.gender || consultation.patient?.gender || 'Male') as 'Male' | 'Female';

      const treatmentType = existingConsultation?.sevviceName ||
        (consultation.service?.name) ||
        `Service ${consultation.serviceID}` ||
        'Consultation';

      const patientImage = existingConsultation?.patientImage ||
        (consultation.patient?.image ? { uri: consultation.patient.image } : undefined);

      // Create consultation request object
      const consultationRequest: ConsultationRequest = {
        id: String(consultation.id),
        patientName: patientName,
        patientAge: patientAge,
        patientGender: patientGender,
        consultationType: consultationType,
        treatmentType: treatmentType,
        patientImage: patientImage,
        patientID: consultation.patientID || existingConsultation?.patientID, // Store patientID
      };

      // Add consultation request to store (this will trigger modal to show)
      const { addRequest } = useConsultationRequestStore.getState();
      addRequest(consultationRequest);

      // Refresh dashboard to get updated consultation data with patient info
      const { fetchDashboardData } = useDashboardStore.getState();
      fetchDashboardData().catch(err => console.error('Error refreshing dashboard:', err));

      // Show toast notification
      const consultationMessage = data?.message ||
        (consultation.status ? `A new consultation is available.` : null) ||
        'A new consultation is available.';

      // Only show toast if doctor is active/online
      const { profileData } = useProfileStore.getState();
      const isActive = profileData?.status === 'Active';

      if (isActive) {
        Toast.info(consultationMessage);
      } else {
        console.log('🔇 [usePusherNotifications] Doctor is offline, suppressing notification toast');
      }
    };

    // Handler for message-sent event
    const handleMessageSent = (data: any) => {
      console.log('Message sent alert:', data);
    };

    // Handler for message-received event
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
    };

    // Bind events
    console.log('🔔 [usePusherNotifications] Binding via PusherService...');

    // 1. Notification Channel
    try {
      pusherService.bind(notificationChannelName, 'notification-send-doctor', handleNotification);
    } catch (err) {
      console.error('❌ Error binding notification:', err);
    }

    // 2. Consultation Channel
    try {
      pusherService.bind(consultationChannelName, 'consultation-doctor', handleConsultationUpdate);
    } catch (err) {
      console.error('❌ Error binding consultation:', err);
    }

    // 3. Send Message Channel
    try {
      pusherService.bind(sendMessageChannelName, 'message-sent', handleMessageSent);
    } catch (err) {
      console.error('❌ Error binding message-sent:', err);
    }

    // 4. Receive Message Channel
    try {
      pusherService.bind(receiveMessageChannelName, 'message-received', handleMessageReceived);
    } catch (err) {
      console.error('❌ Error binding message-received:', err);
    }


    listenersSetRef.current = true;
    console.log('✅ [usePusherNotifications] Pusher setup completed for doctor:', doctorID);

    // Cleanup function
    return () => {
      pusherService.unbind(notificationChannelName, 'notification-send-doctor');
      pusherService.unbind(consultationChannelName, 'consultation-doctor');
      pusherService.unbind(sendMessageChannelName, 'message-sent');
      pusherService.unbind(receiveMessageChannelName, 'message-received');

      pusherService.unsubscribe(notificationChannelName);
      pusherService.unsubscribe(consultationChannelName);
      pusherService.unsubscribe(sendMessageChannelName);
      pusherService.unsubscribe(receiveMessageChannelName);

      listenersSetRef.current = false;
    };
  }, [doctorID, isAuthenticated, isLoading]);

  // Disconnect Pusher when user logs out
  useEffect(() => {
    console.log('🔔 [usePusherNotifications] Logout check effect', {
      isLoading,
      isAuthenticated,
    });

    if (!isLoading && !isAuthenticated) {
      console.log('🔔 [usePusherNotifications] User logged out, disconnecting Pusher...');
      // User has logged out, disconnect Pusher
      try {
        pusherService.disconnect();
        console.log('✅ [usePusherNotifications] Pusher disconnected on logout');
      } catch (err) {
        console.error('❌ [usePusherNotifications] Error disconnecting Pusher on logout:', err);
      }
      listenersSetRef.current = false;
    }
  }, [isAuthenticated, isLoading]);
};

