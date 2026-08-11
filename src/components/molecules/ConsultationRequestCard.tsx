import { mvs } from '@config/metrices';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import Avatar from '@components/common/Avatar';
import { useTranslation } from 'react-i18next';

export type ConsultationType = 'chat' | 'video' | 'audio';

interface ConsultationRequestCardProps {
  patientName: string;
  patientImage?: any;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  consultationType: ConsultationType;
  treatmentType?: string;
  onAccept: () => void;
  onDecline: () => void;
}

const TIMER_DURATION = 122; // seconds

const ConsultationRequestCard = ({
  patientName,
  patientImage,
  patientAge,
  patientGender,
  consultationType,
  treatmentType = 'Acne Treatment',
  onAccept,
  onDecline,
}: ConsultationRequestCardProps) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progress, {
      toValue: 0,
      duration: TIMER_DURATION * 1000,
      useNativeDriver: false,
    }).start();

    // Countdown timer (defer onDecline to avoid updating parent during setState)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onDecline(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getConsultationIcon = () => {
    switch (consultationType) {
      case 'video':
        return 'videocam';
      case 'audio':
        return 'mic';
      case 'chat':
        return 'chatbubble-ellipses';
      default:
        return 'chatbubble-ellipses';
    }
  };

  const capitalizeFirst = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

  const getConsultationLabel = () => {
    switch (consultationType) {
      case 'video':
        return t('chat.video');
      case 'audio':
        return t('chat.audio');
      case 'chat':
        return t('chat.title');
      default:
        return t('chat.title');
    }
  };

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.treatmentType}>{treatmentType}</Text>
        <View style={styles.consultationTypeButton}>
          <Ionicons
            name={getConsultationIcon()}
            size={16}
            color={colors.white}
          />
          <Text style={styles.consultationTypeText}>
            {getConsultationLabel()}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        {/* Patient Info */}
        <View style={styles.patientSection}>
          <Avatar
            name={patientName}
            source={patientImage}
            size={50}
            borderRadius={10}
            fontSize={20}
            style={styles.patientImage}
          />
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientInfo}>
              {capitalizeFirst(String(patientGender))}, {patientAge} {t('consultation.yearOld')}
            </Text>
          </View>
          {/* <Text style={styles.timerText}>{timeLeft}s</Text> */}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={onDecline}
            activeOpacity={0.7}
          >
            <Text style={styles.declineButtonText}>{t('consultation.decline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            activeOpacity={0.7}
          >
            <Text style={styles.acceptButtonText}>{t('consultation.accept')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Animated Timer Bar */}
      <View style={styles.timerBarContainer}>
        <Animated.View style={[styles.timerBar, { width: barWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: mvs(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: mvs(16),
    paddingVertical: mvs(5),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: mvs(16),
    backgroundColor: colors.white,
  },
  treatmentType: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.white,
  },
  consultationTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(6),
    backgroundColor: '#7625D7',
    paddingHorizontal: mvs(12),
    paddingVertical: mvs(6),
    borderRadius: 20,
  },
  consultationTypeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mvs(16),
  },
  patientImage: {
    marginRight: mvs(12),
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: mvs(4),
  },
  patientInfo: {
    fontSize: 14,
    color: '#666',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: mvs(12),
  },
  declineButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: mvs(12),
    alignItems: 'center',
  },
  declineButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '500',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: mvs(12),
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
  },
  timerBarContainer: {
    height: 5,
    backgroundColor: '#EEE',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  timerBar: {
    height: 5,
    backgroundColor: colors.primary,
  },
});

export default ConsultationRequestCard;
