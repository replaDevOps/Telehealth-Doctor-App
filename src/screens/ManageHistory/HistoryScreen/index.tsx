/* HistoryScreen.tsx */
import React, { useState } from 'react';
import { View, TextInput, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import RecentConsultations from '@components/molecules/Organisms/RecentConsultations';

import { useDashboardStore } from '../../../store';
import { useEffect } from 'react';

export function HistoryScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { allConsultations, fetchAllConsultations } = useDashboardStore();


  useEffect(() => {
    fetchAllConsultations();
  }, [fetchAllConsultations]);

  const filteredConsultations = allConsultations.filter(item =>
    item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sevviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title="History" />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient or service name..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consultations */}
        <RecentConsultations
          consultations={filteredConsultations}
          emptyMessage="No consultations found."
          onViewPrescription={id => {

            console.log('View prescription:', id);
            navigation.navigate('PrescriptionDetail', { id });
          }}
          onViewChat={id => {
            console.log('View chat:', id);
            navigation.navigate('Chat', { id });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

