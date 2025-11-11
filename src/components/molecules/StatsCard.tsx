// ==================== FILE: src/components/molecules/StatsCard/index.tsx ====================
import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TotalConsultationSvg } from '@assets/icons';

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
}

const StatsCard = ({ title, value }: StatsCardProps) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer]}>
        <TotalConsultationSvg />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: mvs(12),
    paddingHorizontal: mvs(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: mvs(6),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: mvs(8),
    backgroundColor: colors.primary,
  },
  value: {
    color: colors.secondaryText,
    margin: mvs(4),
  },
  title: {
    fontSize: 15,
    fontWeight: '500',

    color: colors.text,
  },
});

export default StatsCard;
