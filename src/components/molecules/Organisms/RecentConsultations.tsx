import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import ConsultationCard from '../../molecules/ConsultationCard';
import { mvs } from '../../../config/metrices';
import HomeSectionTitle from '../HomeSectionTitle';
import { colors } from '../../../styles/colors';

interface Consultation {
  id: string;
  patientName?: string;
  patientImage?: any;
  sevviceName?: string;
  date?: string;
  time?: string;
  duration?: string;
  type: 'chat' | 'video' | 'audio';
  amount?: string;
  gender?: string;
}

interface RecentConsultationsProps {
  consultations: Consultation[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onViewPrescription?: (id: string) => void;
  onViewChat?: (id: string) => void;
  emptyMessage?: string;
}

const RecentConsultations = ({
  consultations,
  isLoading = false,
  onViewAll,
  onViewPrescription,
  onViewChat,
  emptyMessage = 'No recent consultations found.',
}: RecentConsultationsProps) => {
  // Only show View All button when there are consultations
  const hasConsultations = consultations && consultations.length > 0;
  console.log('RecentConsultations consultations:', consultations);
  return (
    <View style={styles.container}>
      {onViewAll && (
        <HomeSectionTitle
          title="Recent Consultations"
          onActionPress={hasConsultations ? onViewAll : undefined}
        />
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading consultations...</Text>
        </View>
      ) : consultations && consultations.length > 0 ? (
        consultations.map(consultation => (
          <View key={consultation.id}>
            {(consultation.date || consultation.time) && (
              <Text style={styles.dateAbove}>
                {(() => {
                  try {
                    const d = consultation.date ? new Date(consultation.date) : null;
                    const dateStr = d
                      ? `${String(d.getMonth() + 1).padStart(2, '0')}/${String(
                          d.getDate()
                        ).padStart(2, '0')}/${d.getFullYear()}`
                      : consultation.date || '';
                    return `${dateStr}${consultation.time ? ` ${consultation.time}` : ''}`.trim();
                  } catch (e) {
                    return `${consultation.date || ''} ${consultation.time || ''}`.trim();
                  }
                })()}
              </Text>
            )}

            <ConsultationCard
              patientName={consultation.patientName}
              patientImage={consultation.patientImage}
              sevviceName={consultation.sevviceName || 'Service Name'}
              date={consultation.date || ''}
              time={consultation.time || ''}
              duration={consultation.duration || '0 min'}
              type={consultation.type}
              amount={consultation.amount}
              gender={consultation.gender}
              age={consultation.age}
              code={consultation.code}
              status={consultation.status}
              onViewPrescription={() => onViewPrescription?.(consultation.id)}
              onViewChat={() => onViewChat?.(consultation.id)}
            />
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginBottom: mvs(20),
  },
  emptyContainer: {
    padding: mvs(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: mvs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: mvs(12),
    fontSize: 14,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  dateAbove: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: mvs(8),
    marginLeft: mvs(6),
    fontWeight: '500',
  },
});


export default RecentConsultations;
