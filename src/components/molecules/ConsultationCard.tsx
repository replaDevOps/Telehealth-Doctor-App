import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

interface ConsultationCardProps {
  ServiceName?: string;
  patientName: string;
  patientImage?: ImageSourcePropType;
  date: string;
  time: string;
  gender?: string;
  status: string;
  unitOfDuration: string;
  unitOfTime: string;
  age: string;
  duration: string;
  type: 'chat' | 'video' | 'audio';
  amount: string;
  patientId: string;
  onViewPrescription?: () => void;
  onViewChat?: () => void;
}

// Sub-components
const DateHeader = ({ date }: { date: string }) => (
  <View style={styles.dateHeader}>
    <Text style={styles.dateText}>{date}</Text>
  </View>
);

const InfoBar = ({
  patientId,
  time,
  duration,
  unitOfTime,
  unitOfDuration,
  type,
}: {
  patientId: string;
  time: string;
  duration: string;
  unitOfTime: string;
  unitOfDuration: string;
  type: 'chat' | 'video' | 'audio';
}) => {
  const iconName =
    type === 'video' ? 'videocam' : type === 'chat' ? 'chatbubble' : 'mic';
  const { t } = useTranslation();

  return (
    <View style={styles.infoBar}>
      <Text style={styles.ServiceName}>{patientId}</Text>
      <View style={styles.serviceType}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={colors.white} />
          <Text style={styles.timeText}>
            {time} {t(unitOfTime)}
          </Text>
        </View>
        <View style={styles.typeContainer}>
          <Ionicons name={iconName} size={14} color={colors.white} />
          <Text style={styles.typeText}>
            {duration} {t(unitOfDuration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const PatientInfo = ({
  patientName,
  patientImage,
  gender,
  age,
  amount,
}: {
  patientName: string;
  patientImage?: ImageSourcePropType;
  gender: string;
  age: string;
  amount: string;
}) => {
  const initial = patientName.charAt(0).toUpperCase();
  const { t } = useTranslation();

  return (
    <View style={styles.patientSection}>
      <View style={styles.patientInfo}>
        {patientImage ? (
          <Image source={patientImage} style={styles.patientImage} />
        ) : (
          <View style={styles.patientImagePlaceholder}>
            <Text style={styles.patientInitial}>{initial}</Text>
          </View>
        )}
        <View>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.patientGender}>
            {t(gender?.toLowerCase()) || gender}, {age}{' '}
            {age !== '1' ? t('years') : t('year')}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
};

const ServiceStatusRow = ({
  ServiceName,
  status,
}: {
  ServiceName: string;
  status: string;
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.serviceStatusRow}>
      <View style={styles.serviceStatusItem}>
        <Text style={styles.label}>{t('service')}</Text>
        <Text style={styles.value}>{ServiceName}</Text>
      </View>
      <View style={[styles.serviceStatusItem, styles.statusWithBorder]}>
        <Text style={styles.label}>{t('status')}</Text>
        <Text style={[styles.value, styles.statusText]}>{status}</Text>
      </View>
    </View>
  );
};

const ActionButtons = ({
  type,
  onViewPrescription,
  onViewChat,
}: {
  type: 'chat' | 'video' | 'audio';
  onViewPrescription?: () => void;
  onViewChat?: () => void;
}) => {
  const isChat = type === 'chat';
  const { t } = useTranslation();

  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[
          styles.prescriptionButton,
          isChat ? styles.buttonHalf : styles.buttonFull,
        ]}
        onPress={onViewPrescription}
        activeOpacity={0.7}
      >
        <Text style={styles.prescriptionButtonText}>
          {t('view_prescription')}
        </Text>
      </TouchableOpacity>

      {isChat && onViewChat && (
        <TouchableOpacity
          style={[styles.chatButton, styles.buttonHalf]}
          onPress={onViewChat}
          activeOpacity={0.7}
        >
          <Text style={styles.chatButtonText}>{t('view_chat')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Main Component
const ConsultationCard: React.FC<ConsultationCardProps> = ({
  ServiceName = 'Service Name',
  patientName,
  patientImage,
  date,
  unitOfDuration,
  time,
  unitOfTime,
  gender = 'Male',
  status,
  age,
  duration,
  type,
  amount,
  patientId,
  onViewPrescription,
  onViewChat,
}) => {
  return (
    <View style={styles.card}>
      <DateHeader date={date} />
      <View style={styles.cardContent}>
        <InfoBar
          patientId={patientId}
          time={time}
          unitOfTime={unitOfTime}
          duration={duration}
          unitOfDuration={unitOfDuration}
          type={type}
        />
        <PatientInfo
          patientName={patientName}
          patientImage={patientImage}
          gender={gender}
          age={age}
          amount={amount}
        />
        <ServiceStatusRow ServiceName={ServiceName} status={status} />
        <ActionButtons
          type={type}
          onViewPrescription={onViewPrescription}
          onViewChat={onViewChat}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: mvs(16),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardContent: {
    backgroundColor: colors.gray,
  },

  // Date Header
  dateHeader: {
    paddingVertical: mvs(8),
    paddingHorizontal: mvs(16),
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Info Bar
  infoBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(16),
    gap: mvs(16),
    borderTopRightRadius: mvs(10),
    borderTopLeftRadius: mvs(10),
  },
  ServiceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  serviceType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(12),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(6),
  },
  timeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(6),
  },
  typeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },

  // Patient Section
  patientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: mvs(16),
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(12),
  },
  patientImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  patientImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E8D5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7625D7',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  patientGender: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },

  // Service & Status Row
  serviceStatusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
    marginVertical: mvs(14),
    paddingHorizontal: mvs(16),
  },
  serviceStatusItem: {
    alignItems: 'center',
  },
  statusWithBorder: {
    borderLeftWidth: 2,
    borderLeftColor: colors.borderDark,
    paddingLeft: 20,
  },
  label: {
    fontSize: 18,
    color: colors.secondaryText,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  statusText: {
    color: colors.green,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: mvs(12),
    paddingHorizontal: mvs(16),
    paddingBottom: mvs(16),
  },
  buttonFull: { flex: 1 },
  buttonHalf: { flex: 1 },

  prescriptionButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: mvs(10),
    alignItems: 'center',
  },
  prescriptionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  chatButton: {
    backgroundColor: '#7625D7',
    borderRadius: 8,
    paddingVertical: mvs(10),
    alignItems: 'center',
  },
  chatButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ConsultationCard;
