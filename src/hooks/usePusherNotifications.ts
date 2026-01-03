import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { pusherService } from '../services/pusher/PusherService';
import { useAuthStore } from '../store';
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
    const handleNotification = (data: any) => {
      console.log('Doctor notification received:', data);
      Alert.alert("Message received alert:\n" + JSON.stringify(data));
      // Show toast notification
      if (data?.message || data?.title) {
        Toast.info(data.message || data.title);
      }
    };

    // Handler for consultation-doctor event
    const handleConsultationUpdate = (data: any) => {
      console.log('Consultation update received:', data);
      Alert.alert("Message received alert:\n" + JSON.stringify(data));
      // Show toast notification
      if (data?.message || data?.status) {
        Toast.info(data.message || `Consultation ${data.status}`);
      }
    };

    // Handler for message-sent event
    const handleMessageSent = (data: any) => {
      console.log('Message sent alert:', data);
      Alert.alert("Message sent alert:\n" + JSON.stringify(data));
    };

    // Handler for message-received event
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
      Alert.alert("Message received alert:\n" + JSON.stringify(data));
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

