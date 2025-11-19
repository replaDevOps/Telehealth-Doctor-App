import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { PatientInfo } from '../../../types/chat.types';
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  patientInfo: PatientInfo;
  consultationTime: string;
  fromHistory: boolean;
  handleGoBack: () => void;
  handleEndConsultation: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  patientInfo,
  consultationTime,
  fromHistory,
  handleGoBack,
  handleEndConsultation,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.patientHeaderContainer}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.patientHeaderCenter}>
        <Text style={styles.patientName}>{patientInfo.name}</Text>
        <Text style={styles.consultationTime}>
          {patientInfo.serviceName || consultationTime}
        </Text>
      </View>

      {!fromHistory && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndConsultation}
        >
          <Text style={styles.endButtonText}>{t('end')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
