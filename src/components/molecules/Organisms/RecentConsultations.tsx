import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ConsultationCard from '../../molecules/ConsultationCard';
import { mvs } from '../../../config/metrices';
import HomeSectionTitle from '../HomeSectionTitle';
import { colors } from '../../../styles/colors';

interface Consultation {
  id: string;
  patientName: string;
  patientImage?: any;
  sevviceName: string;
  date: string;
  time: string;
  duration: string;
  type: 'chat' | 'video' | 'audio';
  amount: string;
  gender: string;
}

interface RecentConsultationsProps {
  consultations: Consultation[];
  onViewAll?: () => void;
  onViewPrescription?: (id: string) => void;
  onViewChat?: (id: string) => void;
  emptyMessage?: string;
}

const RecentConsultations = ({
  consultations,
  onViewAll,
  onViewPrescription,
  onViewChat,
  emptyMessage = 'No recent consultations found.',
}: RecentConsultationsProps) => {
  return (
    <View style={styles.container}>
      {onViewAll && (
        <HomeSectionTitle
          title="Recent Consultations"
          onActionPress={onViewAll}
        />
      )}
      {consultations && consultations.length > 0 ? (
        consultations.map(consultation => (
          <ConsultationCard
            key={consultation.id}
            patientName={consultation.patientName}
            patientImage={consultation.patientImage}
            sevviceName={consultation.sevviceName}
            date={consultation.date}
            time={consultation.time}
            duration={consultation.duration}
            type={consultation.type}
            amount={consultation.amount}
            gender={consultation.gender}
            onViewPrescription={() => onViewPrescription?.(consultation.id)}
            onViewChat={() => onViewChat?.(consultation.id)}
          />
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
});


export default RecentConsultations;
