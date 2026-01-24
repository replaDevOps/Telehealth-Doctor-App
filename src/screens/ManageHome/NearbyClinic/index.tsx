import { View, Text } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export const NearbyClinics = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('screens.nearbyClinic')} />
      <View style={styles.container}>
        <Text style={styles.text}>map view</Text>
      </View>
    </SafeAreaView>
  );
};

export default NearbyClinics;
