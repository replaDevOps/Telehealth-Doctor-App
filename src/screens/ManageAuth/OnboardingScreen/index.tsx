import React, { useState, useRef } from 'react';
import { ScrollView, View, Image, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header2 } from '../../../components/common/Header2';
import { CustomButton } from '../../../components/common/CustomButton';
import { styles } from './styles';
import { FeatureItem } from './Components';
import { ONBOARDING_STEPS, ONBOARDING_STEPS_ARABIC } from '../../../constants';
import { colors } from '../../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { mvs } from '../../../config/metrices';

// Collect all onboarding image sources for preloading
const ALL_ONBOARDING_IMAGES = [
  ...ONBOARDING_STEPS.map(s => s.imgSrc),
  ...ONBOARDING_STEPS_ARABIC.map(s => s.imgSrc),
];

export function OnboardingScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { t, i18n } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const onboardingSteps = isArabic ? ONBOARDING_STEPS_ARABIC : ONBOARDING_STEPS;

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const goToStep = (nextStep: number) => {
    // Fade out → switch step → fade in
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    const isLastStep = currentStep === onboardingSteps.length - 1;
    if (isLastStep) {
      markOnboardingComplete();
      navigation.replace('SignIn');
    } else {
      goToStep(currentStep + 1);
    }
  };

  const activeStep = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      {/* Pre-render all images at actual display size so decoding is done upfront */}
      <View style={preloadStyles.hidden} pointerEvents="none">
        {ALL_ONBOARDING_IMAGES.map((src, i) => (
          <Image
            key={i}
            source={src}
            style={preloadStyles.fullSizeImage}
            resizeMode="cover"
          />
        ))}
      </View>

      <Header2
        title=""
        back={false}
        useSkip={true}
        handleSkip={async () => {
          console.log('Skip pressed');
          await markOnboardingComplete();
          navigation.replace('Auth', { screen: 'SignIn' });
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <FeatureItem
            title={activeStep?.title}
            content={activeStep?.content}
            imgSrc={activeStep?.imgSrc}
            currentStep={currentStep}
          />
        </Animated.View>
      </ScrollView>

      <View style={styles.button}>
        <CustomButton title={t('common.next', 'Next')} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}

const preloadStyles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    // overflow hidden keeps them out of the visible hierarchy
    overflow: 'hidden',
    height: mvs(400),
    pointerEvents: 'none',
  },
  fullSizeImage: {
    width: '100%',
    height: mvs(400),
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
