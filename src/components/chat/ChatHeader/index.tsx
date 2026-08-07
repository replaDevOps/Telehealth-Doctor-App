import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header2 } from '@components/common/Header2';
import Avatar from '@components/common/Avatar';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { DoctorInfo } from '../../../types/chat.types';
import { AiChatHistoryBottomSheet } from '../AiChatHistoryBottomSheet';

export type PatientInfoHeader = {
  id?: string | number;
  name?: string;
  image?: string | { uri: string };
  age?: string | number;
  gender?: string;
};

interface ChatHeaderProps {
  chatType: 'ai' | 'doctor';
  doctorInfo: DoctorInfo;
  /** Display name shown in header center (e.g. "Dr. Sultan Khan") */
  doctorDisplayName?: string;
  consultationId?: string | number;
  consultationTime: string;
  fromHistory: boolean;
  handleGoBack: () => void;
  handleEndConsultation: () => void;
  isConsultationActive?: boolean;
  consultationData?: {
    patient?: {
      name?: string;
      image?: string;
      age?: string | number;
      gender?: string;
    };
    service?: {
      name?: string;
      duration?: number;
    };
    type?: string;
    code?: string;
  } | null;
  patientInfo?: PatientInfoHeader | null;
  onZIconPress?: () => void;
}

function capitalizeFirst(s: string): string {
  if (!s || !s.length) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatGenderAge(gender?: string, age?: string | number): string {
  const g = gender ? capitalizeFirst(String(gender).trim()) : '';
  const a = age != null && age !== '' ? Number(age) : NaN;
  if (g && !Number.isNaN(a)) return `${g}, ${a} Year${a !== 1 ? 's' : ''} old`;
  if (g) return g;
  if (!Number.isNaN(a)) return `${a} Year${a !== 1 ? 's' : ''} old`;
  return '';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatType,
  doctorInfo,
  doctorDisplayName,
  consultationId,
  consultationTime,
  fromHistory,
  handleGoBack,
  handleEndConsultation,
  isConsultationActive = false,
  consultationData,
  patientInfo,
  onZIconPress,
}) => {
  const { t } = useTranslation();
  const [aiHistoryVisible, setAiHistoryVisible] = useState(false);
  const headerDisplayText = consultationId ? 'Customer Support' : (doctorDisplayName || doctorInfo.name);

  const patient = consultationData?.patient;
  const patientName = patient?.name || patientInfo?.name || 'Patient';
  // Avatar resolves relative paths against the media host and falls back to initials.
  const patientImage = patient?.image || patientInfo?.image;
  const gender = patient?.gender ?? patientInfo?.gender ?? '';
  const age = patient?.age ?? patientInfo?.age ?? '';
  const genderAgeLine = formatGenderAge(gender, age);

  const serviceName = consultationData?.service?.name || '';
  const consultationType = consultationData?.type || '';
  const consultationCode = consultationData?.code || '';
  const serviceDuration = consultationData?.duration;
  const buildSubtitle = () => {
    if (isConsultationActive && !fromHistory) return consultationTime;
    if (!consultationData) return consultationTime;
    const parts: string[] = [];
    if (consultationCode) parts.push(consultationCode);
    if (serviceName) parts.push(serviceName);
    if (consultationType) parts.push(consultationType);
    if (serviceDuration) parts.push(`${serviceDuration}`);
    // if()
    return parts.length > 0 ? parts.join(' | ') : consultationTime;
  };

  return chatType === 'ai' ? (
    <Header2 title={t('chat.title')} showCart logo />
  ) : (
    <View style={styles.headerWrapper}>
      {/* Top bar: Back | Doctor name + Timer | End */}
      <View style={styles.doctorHeaderContainer}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.doctorHeaderCenter}>
          <Text style={styles.doctorName} numberOfLines={1}>{headerDisplayText}</Text>
          <Text style={styles.consultationTime}>{buildSubtitle()}</Text>
        </View>
        {!fromHistory ? (
          <TouchableOpacity style={styles.endButton} onPress={handleEndConsultation}>
            <Text style={styles.endButtonText}>{t('chat.end')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.endButtonSpacer} />
        )}
      </View>

      {/* Patient info card */}
      <View style={styles.patientCard}>
        <View style={styles.patientInfoRow}>
          <View style={styles.patientAvatarWrapper}>
            <Avatar
              name={patientName}
              source={patientImage}
              size={44}
              fontSize={18}
            />
          </View>
          <View style={styles.patientTextBlock}>
            <Text style={styles.patientName} numberOfLines={1}>{patientName}</Text>
            {genderAgeLine ? (
              <Text style={styles.patientDemographics} numberOfLines={1}>{genderAgeLine}</Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.chatHistoryButton}
          onPress={() => setAiHistoryVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.chatHistoryButtonText} numberOfLines={1}>AI Chat History</Text>
        </TouchableOpacity>
      </View>

      <AiChatHistoryBottomSheet
        visible={aiHistoryVisible}
        patientId={patientInfo?.id}
        onClose={() => setAiHistoryVisible(false)}
      />
    </View>
  );
};
