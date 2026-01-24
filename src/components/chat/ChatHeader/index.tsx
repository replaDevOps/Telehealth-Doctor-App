
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { DoctorInfo } from '../../../types/chat.types';

interface ChatHeaderProps {
  chatType: 'ai' | 'doctor';
  doctorInfo: DoctorInfo;
  consultationTime: string;
  fromHistory: boolean;
  handleGoBack: () => void;
  handleEndConsultation: () => void;
  isConsultationActive?: boolean; // Add flag to show timer when active
  consultationData?: {
    patient?: {
      name?: string;
      image?: string;
    };
    service?: {
      name?: string;
      duration?: number;
    };
    type?: string;
    code?: string;
  } | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatType,
  doctorInfo,
  consultationTime,
  fromHistory,
  handleGoBack,
  handleEndConsultation,
  isConsultationActive = false,
  consultationData,
}) => {
  const { t } = useTranslation();
  // Extract patient and service info from consultation data
  const patientName = consultationData?.patient?.name || 'Patient';
  const serviceName = consultationData?.service?.name || '';
  const consultationType = consultationData?.type || '';
  const consultationCode = consultationData?.code || '';
  const serviceDuration = consultationData?.service?.duration;
  
  // Build subtitle: Show countdown timer when consultation is active, otherwise show service info
  const buildSubtitle = () => {
    // When consultation is active, always show the countdown timer
    if (isConsultationActive && !fromHistory) {
      return consultationTime; // This is the formatted countdown timer (MM:SS)
    }
    
    // When viewing history, show service info
    if (!consultationData) {
      return consultationTime;
    }
    
    const parts: string[] = [];
    // Add code if available
    if (consultationCode) {
      parts.push(consultationCode);
    }
    // Add service name if available
    if (serviceName) {
      parts.push(serviceName);
    }
    // Add type if available
    if (consultationType) {
      parts.push(consultationType);
    }
    // Add duration if available
    if (serviceDuration) {
      parts.push(`${serviceDuration}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : consultationTime;
  };

  return chatType === 'ai' ? (
    <Header2 title={t('chat.title')} showCart logo />
  ) : (
    <View style={styles.doctorHeaderContainer}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.doctorHeaderCenter}>
        <Text style={styles.doctorName}>{patientName}</Text>
        <Text style={styles.consultationTime}>
          {buildSubtitle()}
        </Text>
      </View>

      {!fromHistory && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndConsultation}
        >
          <Text style={styles.endButtonText}>{t('chat.end')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
