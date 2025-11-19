import React, { useState, useMemo } from 'react';
import { View, ScrollView, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import { CONSULTATION_REQUESTS } from '@constants';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';
import { SearchBar } from '@components/atoms';
import { useTranslation } from 'react-i18next';

export function HistoryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  // Filter consultations based on search query
  const filteredConsultations = useMemo(() => {
    if (!searchQuery.trim()) {
      return CONSULTATION_REQUESTS;
    }

    const query = searchQuery.toLowerCase().trim();
    return CONSULTATION_REQUESTS.filter(consultation =>
      consultation.patientName.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleSearchChange = text => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('history')} />

      {/* Search Component */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        placeholder={t('search_by_patient_name')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <RecentConsultations
          consultations={filteredConsultations}
          onViewPrescription={id => {
            console.log('View prescription:', id);
            navigation.navigate('PrescriptionDetail', { id });
          }}
          onViewChat={id => {
            console.log('View chat:', id);
            navigation.navigate('ChatScreen', { id, fromHistory: true });
          }}
        />

        {/* Show message when no results found */}
        {filteredConsultations.length === 0 && searchQuery.trim() !== '' && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {t('no_patients_found')} "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
