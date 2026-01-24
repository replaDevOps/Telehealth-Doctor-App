/* HistoryScreen.tsx */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, TextInput, ScrollView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';

import { useDashboardStore } from '../../../store';

export function HistoryScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { allConsultations, fetchAllConsultations, isLoading } = useDashboardStore();


  useEffect(() => {
    fetchAllConsultations();
  }, [fetchAllConsultations]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllConsultations();
    } catch (e) {
      console.error('Failed to refresh consultations', e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredConsultations = allConsultations.filter(item =>
    (item.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.sevviceName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('history.title')} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('history.searchPlaceholder')}
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Consultations */}
        <RecentConsultations
          consultations={filteredConsultations}
          isLoading={isLoading}
          emptyMessage={t('recent.noRecentConsultations')}
          onViewPrescription={id => {
            console.log('View prescription:', id);
            navigation.navigate('PrescriptionDetail', { id });
          }}
          onViewChat={id => {
            console.log('View chat:', id);
            // Find the consultation data to pass patient info
            const consultation = allConsultations.find(cons => cons.id === id);
            navigation.navigate('ChatScreen', { 
              id,
              consultationId: id,
              patientID: consultation?.patientID,
              patientInfo: consultation ? {
                id: consultation.patientID,
                name: consultation.patientName,
                image: consultation.patientImage,
              } : null,
              chatType: 'doctor',
              fromHistory: true,
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

