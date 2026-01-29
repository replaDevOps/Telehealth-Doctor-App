import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n from '../locales/i18n';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔄 LanguageProvider rendering with language:', language);

  // Load saved language on mount
  useEffect(() => {
    // Ensure LTR layout is enforced on mount
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
      console.log('🔄 Forced LTR on mount');
    }
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      console.log('📚 Loading saved language from AsyncStorage...');
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      console.log('📚 Saved language value:', savedLanguage);

      if (savedLanguage === 'en' || savedLanguage === 'ar') {
        console.log('📚 Setting language state to:', savedLanguage);
        setLanguageState(savedLanguage);
        // Also update i18n language
        await i18n.changeLanguage(savedLanguage);
        console.log('📚 i18n language changed to:', savedLanguage);
      } else {
        console.log('📚 No valid saved language, defaulting to: en');
        await i18n.changeLanguage('en');
      }
    } catch (error) {
      console.error('📚 Error loading language:', error);
    } finally {
      setIsLoading(false);
      console.log('📚 Language loading complete');
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      // Update i18n language
      await i18n.changeLanguage(lang);
      console.log('🌐 i18n language changed to:', lang);

      // Force LTR layout always (Disable RTL)
      if (I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        console.log('🌐 RTL disabled, forcing LTR');
      }

      console.log('🌐 setLanguage called - Changing from', language, 'to', lang);
      await AsyncStorage.setItem('selectedLanguage', lang);
      console.log('🌐 AsyncStorage updated successfully');

      setLanguageState(lang);
      console.log('🌐 Language state updated to:', lang);

      // Verify it was saved
      const saved = await AsyncStorage.getItem('selectedLanguage');
      console.log('🌐 Verified saved language in AsyncStorage:', saved);
    } catch (error) {
      console.error('🌐 Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
