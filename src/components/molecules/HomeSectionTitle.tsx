import { mvs } from '@config/metrices';
import { colors } from '../../styles/colors';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface HomeSectionTitleProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

const HomeSectionTitle = ({
  title,
  actionText,
  onActionPress,
}: HomeSectionTitleProps) => {
  const { t } = useTranslation();
  const resolvedActionText = actionText ?? t('recent.viewAll');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.actionText}>{resolvedActionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: mvs(16),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  actionText: {
    fontSize: 14,
    borderWidth: 1,
    paddingHorizontal: mvs(10),
    paddingVertical: mvs(5),
    borderRadius: mvs(5),
    borderColor: colors.border,
    backgroundColor: colors.gray,
  },
});

export default HomeSectionTitle;
