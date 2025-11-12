import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ConsultationCardProps {
  sevviceName: string;
  patientName: string;
  patientImage?: any;
  date: string;
  time: string;
  gender: string;
  status: string;
  age: string;
  duration: string;
  type: 'chat' | 'video' | 'audio';
  amount: string;
  patientId: string;
  onViewPrescription?: () => void;
  onViewChat?: () => void;
}

const ConsultationCard = ({
  sevviceName = 'Service Name',
  patientName,
  patientImage,
  date,
  time,
  status,
  age,
  duration,
  type,
  amount,
  gender = 'Male',
  patientId,
  onViewPrescription,
  onViewChat,
}: ConsultationCardProps) => {
  const isChat = type === 'chat';

  return (
    <View style={styles.card}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <View style={styles.cardContent}>
        {/* Consultation Info Bar */}
        <View style={styles.infoBar}>
          <View>
            <Text style={styles.serviceName}>{patientId}</Text>
          </View>
          <View style={styles.serviceType}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={colors.white} />
              <Text style={styles.timeText}>{time}</Text>
            </View>
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
              <Text style={styles.typeText}>{duration}</Text>
            </View>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.patientSection}>
          <View style={styles.patientInfo}>
            {patientImage ? (
              <Image source={patientImage} style={styles.patientImage} />
            ) : (
              <View style={styles.patientImagePlaceholder}>
                <Text style={styles.patientInitial}>
                  {patientName.charAt(0)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.patientName}>{patientName}</Text>
              <Text style={styles.patientGender}>
                {gender}, {age} year
              </Text>
            </View>
          </View>
          <Text style={styles.amount}>{amount}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 50,
            marginVertical: mvs(14),
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, color: colors.secondaryText }}>
              Service
            </Text>
            <Text
              style={{ fontWeight: '500', fontSize: 16, color: colors.text }}
            >
              {sevviceName}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              borderLeftColor: colors.borderDark,
              borderLeftWidth: 2,
              paddingLeft: 20,
            }}
          >
            <Text style={{ fontSize: 18, color: colors.secondaryText }}>
              Status
            </Text>
            <Text
              style={{ fontSize: 16, fontWeight: '500', color: colors.green }}
            >
              {status}
            </Text>
          </View>
        </View>

        {/* Action Buttons - Conditional Rendering */}
        <View style={styles.actionButtons}>
          {/* Always show View Prescription */}
          <TouchableOpacity
            style={[
              isChat
                ? styles.prescriptionButtonChat
                : styles.prescriptionButtonFull,
            ]}
            onPress={onViewPrescription}
            activeOpacity={0.7}
          >
            <Text style={styles.prescriptionButtonText}>View Prescription</Text>
          </TouchableOpacity>

          {/* Only show View Chat if type is 'chat' */}
          {isChat && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={onViewChat}
              activeOpacity={0.7}
            >
              <Text style={styles.chatButtonText}>View Chat</Text>
            </TouchableOpacity>
          )}
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
  },
  cardContent: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  dateHeader: {
    backgroundColor: colors.white,
    paddingVertical: mvs(8),
    paddingHorizontal: mvs(16),
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoBar: {
    backgroundColor: '#7625D7',
    flexDirection: 'row',
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(16),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: mvs(16),
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  serviceType: { flexDirection: 'row', alignItems: 'center', gap: mvs(12) },
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
  actionButtons: {
    flexDirection: 'row',
    gap: mvs(12),
    paddingHorizontal: mvs(16),
    paddingBottom: mvs(16),
  },
  // Full width for prescription when no chat button
  prescriptionButtonFull: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: mvs(10),
    alignItems: 'center',
  },
  // Half width when chat button is present
  prescriptionButtonChat: {
    flex: 1,
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
  },
  chatButton: {
    flex: 1,
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
