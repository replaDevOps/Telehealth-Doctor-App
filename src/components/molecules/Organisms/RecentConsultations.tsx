import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConsultationCard from '../../molecules/ConsultationCard';
import { mvs } from '../../../config/metrices';
import HomeSectionTitle from '../HomeSectionTitle';
import { useTranslation } from 'react-i18next';

interface Consultation {
  id: string;
  patientName: string;
  patientImage?: any;
  ServiceName: string;
  date: string;
  time: string;
  duration: string;
  type: 'chat' | 'video' | 'audio';
  amount: string;
  gender: string;
  age: string;
  status: string;
  unitOfDuration: string;
  unitOfTime: string;
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
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {onViewAll && (
        <HomeSectionTitle
          title={t('recent_consultations')}
          onActionPress={onViewAll}
        />
      )}
      {consultations.map(consultation => (
        <ConsultationCard
          key={consultation.id}
          patientId={consultation.id}
          patientName={consultation.patientName}
          patientImage={consultation.patientImage}
          ServiceName={consultation.ServiceName}
          date={consultation.date}
          unitOfDuration={consultation.unitOfDuration}
          time={consultation.time}
          unitOfTime={consultation.unitOfTime}
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
