import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { Header2 } from '../../../components/common/Header2';
import CustomText from '../../../components/common/CustomText';
import { AmericaFlgSvg, SaudiFlgSvg } from '../../../assets/icons';
import { mvs } from '../../../config/metrices';
import { CustomButton } from '../../../components/common/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { LanguageSelection } from '@assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useLanguage } from '../../../context/LanguageContext';

export function LanguageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<'en' | 'ar'>(language);

  // Load the current language when component mounts
  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  const handleNext = async () => {
    console.log('Selected Language:', selectedLang);
    console.log('Current language before update:', language);

    try {
      // Update language in context (which also saves to AsyncStorage)
      await setLanguage(selectedLang);
      console.log('Language updated successfully to:', selectedLang);
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Auth', { screen: 'Onboarding' });
      }
    } catch (error) {
      console.error('Error saving language selection:', error);
      // Still navigate even if save fails
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Auth', { screen: 'Onboarding' });
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      <Header2 title="" back={false} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ marginBottom: mvs(50) }}>
          <Image source={LanguageSelection} style={styles.image} />

          <View style={styles.content}>
            <View style={{ ...styles.title }}>
              <CustomText text={t('language.title')} />
            </View>
            <View style={styles.content}>
              <Text style={styles.TextContent}>
                {t('language.subtitle')}
              </Text>
            </View>
          </View>

          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[
                styles.langOption,
                selectedLang === 'en' && styles.activeLangOption,
              ]}
              onPress={() => setSelectedLang('en')}
            >
              <View style={{ flexDirection: 'row', gap: mvs(10) }}>
                <View style={styles.radioOuter}>
                  {selectedLang === 'en' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langText}>{t('language.english')}</Text>
              </View>
              <AmericaFlgSvg />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                selectedLang === 'ar' && styles.activeLangOption,
              ]}
              onPress={() => setSelectedLang('ar')}
            >
              <View style={{ flexDirection: 'row', gap: mvs(10) }}>
                <View style={styles.radioOuter}>
                  {selectedLang === 'ar' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langText}>{t('language.arabic')}</Text>
              </View>
              <SaudiFlgSvg />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.button}>
        <CustomButton title={t('common.next')} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
