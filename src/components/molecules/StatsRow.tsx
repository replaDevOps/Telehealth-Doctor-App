import React from 'react';
import { View, StyleSheet } from 'react-native';
import { mvs } from '@config/metrices';
import StatsCard from './StatsCard';
import { useTranslation } from 'react-i18next';

interface StatsRowProps {
  totalConsultations?: number;
  thisMonth?: number;
}

const StatsRow = ({
  totalConsultations = 142,
  thisMonth = 28,
}: StatsRowProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <StatsCard
        icon="chatbubbles"
        title={t('total_consultations')}
        value={totalConsultations}
        color="#7625D7"
      />
      <StatsCard
        icon="calendar"
        title={t('this_month_consul')}
        value={thisMonth}
        color="#FF6B6B"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: mvs(20),
    marginHorizontal: mvs(-6),
  },
});

export default StatsRow;
