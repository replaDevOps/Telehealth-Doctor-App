import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ConsultationCardProps {
  sevviceName: string;
  patientName?: string;
  patientImage?: any;
  date: string;
  time: string;
  gender?: string;
  age?: string;
  duration?: string | null;
  type: 'chat' | 'video' | 'audio';
  amount?: string;
  code?: string;
  status?: string;
  onViewPrescription?: () => void;
  onViewChat?: () => void;
}

const ConsultationCard = ({
  sevviceName = 'Service Name',
  patientName = 'Unknown Patient',
  patientImage,
  date,
  time,
  duration,
  type,
  amount = '',
  gender = 'Male',
  age = '',
  code = '',
  status = '',
  onViewPrescription,
  onViewChat,
}: ConsultationCardProps) => {
  // Format patient info: Gender and Age
  const patientInfo = [gender, age ? `${age} Year` : ''].filter(Boolean).join(', ');

  // Get status color
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'paid' || lowerStatus === 'completed') return colors.green;
    if (lowerStatus === 'pending') return colors.yellow;
    if (lowerStatus === 'cancelled' || lowerStatus === 'rejected') return colors.red;
    return colors.secondaryText;
  };

  return (
    <View style={styles.card}>
      {/* Header with Code, Type, and Duration */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <Text style={styles.codeText}>{code ? `#${code}` : ''}</Text>

        </View>
        <View style={styles.serviceType}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={
                type === 'video'
                  ? 'videocam'
                  : type === 'chat'
                  ? 'chatbubble'
                  : 'mic'
              }
              size={14}
              color={colors.white}
            />
            <Text style={styles.typeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
          </View>
          {duration && duration.trim() !== '' && duration !== 'null' && duration.toLowerCase() !== 'null' && (
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={colors.white} />
              <Text style={styles.timeText}>{duration}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardContent}>

        {/* Patient Info */}
        <View style={styles.patientSection}>
          <View style={styles.patientInfo}>
            {patientImage ? (
              <Image source={patientImage} style={styles.patientImage} />
            ) : (
              <View style={styles.patientImagePlaceholder}>
                <Text style={styles.patientInitial}>
                  {patientName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>{patientName || 'Unknown Patient'}</Text>
              <Text style={styles.patientGender}>{patientInfo || ''}</Text>
            </View>
          </View>
          <Text style={styles.amount}>{amount}</Text>
        </View>

        {/* Service and Status Row */}
        <View style={styles.serviceStatusRow}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceLabel}>Service</Text>
            <Text style={styles.serviceValue} numberOfLines={1}>{sevviceName}</Text>
          </View>
          {status && (
            <>
              <View style={styles.separator} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Status</Text>
                <Text style={[styles.statusValue, { color: getStatusColor(status) }]}>
                  {status}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons - Only show View Chat for chat consultations, always show View Prescription */}
        <View style={styles.actionButtons}>
          {/* Only show View Chat button for chat type consultations */}
          {type === 'chat' && onViewChat && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={onViewChat}
              activeOpacity={0.7}
            >
              <Text style={styles.chatButtonText}>View Chat</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.prescriptionButton, type === 'chat' && onViewChat ? {} : styles.prescriptionButtonFullWidth]}
            onPress={onViewPrescription}
            activeOpacity={0.7}
          >
            <Text style={styles.prescriptionButtonText}>View Prescription</Text>
          </TouchableOpacity>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  infoBar: {
    backgroundColor: '#7625D7',
    flexDirection: 'row',
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(16),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  infoLeft: {
    flexDirection: 'column',
    maxWidth: '60%'
  },
  dateText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.95,
  },
  serviceType: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: mvs(16) 
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
    flex: 1,
  },
  patientDetails: {
    flex: 1,
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
    fontWeight: '400',
    color: colors.secondaryText,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  serviceStatusRow: {
    flexDirection: 'row',
    paddingHorizontal: mvs(16),
    paddingBottom: mvs(12),
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: mvs(4),
  },
  serviceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: mvs(12),
  },
  statusInfo: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: mvs(4),
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: mvs(12),
    paddingHorizontal: mvs(16),
    paddingBottom: mvs(16),
  },
  chatButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: mvs(10),
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  prescriptionButton: {
    flex: 1,
    backgroundColor: '#7625D7',
    borderRadius: 8,
    paddingVertical: mvs(10),
    alignItems: 'center',
  },
  prescriptionButtonFullWidth: {
    flex: 1,
    width: '100%',
  },
  prescriptionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ConsultationCard;
