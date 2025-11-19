import { OffSvg } from '@assets/icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';

interface InfoItem {
  label: string;
  value: string | number;
  isDayOff?: boolean;
}

interface InfoSectionProps {
  title: string;
  data: InfoItem[];
}

export const InfoSection: React.FC<InfoSectionProps> = ({ title, data }) => {
  const { t } = useTranslation();

  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.section}>
        {data.map((item, index) => (
          <View key={index} style={styles.rowBetween}>
            <Text style={[styles.label]}>{t(item.label)}</Text>
            <View style={styles.valueContainer}>
              {item.isDayOff && (
                <View style={styles.closeIcon}>
                  <OffSvg />
                </View>
              )}
              <Text style={[styles.value, item.isDayOff && styles.valueDayOff]}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#222',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  labelDayOff: {
    color: '#999',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  valueDayOff: {
    color: colors.secondaryText,
    fontStyle: 'italic',
  },
  closeIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeLine1: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#999',
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#999',
    transform: [{ rotate: '-45deg' }],
  },
});
