import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConsultationCard from '../../molecules/ConsultationCard';
import { mvs } from '../../../config/metrices';
import HomeSectionTitle from '../HomeSectionTitle';

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
  age: string;
  status: string;
}

interface RecentConsultationsProps {
  consultations: Consultation[];
  onViewAll?: () => void;
  onViewPrescription?: (id: string) => void;
  onViewChat?: (id: string) => void;
}

const RecentConsultations = ({
  consultations,
  onViewAll,
  onViewPrescription,
  onViewChat,
}: RecentConsultationsProps) => {
  return (
    <View style={styles.container}>
      {onViewAll && (
        <HomeSectionTitle
          title="Recent Consultations"
          onActionPress={onViewAll}
        />
      )}
      {consultations.map(consultation => (
        <ConsultationCard
          key={consultation.id}
          patientId={consultation.id}
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
          status={consultation.status}
          age={consultation.age}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: mvs(20),
  },
});

export default RecentConsultations;
