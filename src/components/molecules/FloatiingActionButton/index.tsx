import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { mvs } from '@config/metrices';
import { styles } from './style';
import { colors } from '../../../styles/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

const OFFSET = 70; // Vertical offset for buttons

// Individual Animated Button Component
const AnimatedFabButton = ({ isExpanded, index, icon, onPress, label }) => {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;
    const scaleValue = isExpanded.value ? 1 : 0;
    const opacityValue = isExpanded.value ? 1 : 0;

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(delay, withTiming(scaleValue)),
        },
      ],
      opacity: withDelay(delay, withTiming(opacityValue)),
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[animatedStyles, styles.fabButton]}
    >
      <View style={styles.fabButtonContent}>
        <View style={styles.fabIconContainer}>
          <Ionicons
            name={icon}
            size={22}
            color={colors.primary}
            style={{
              backgroundColor: colors.white,
              padding: mvs(10),
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </View>
        <Text style={styles.fabLabel}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
};

// Main FAB Component
export const FloatingActionButton = ({
  onPrescriptionPress,
  onAIChatPress,
}) => {
  const isExpanded = useSharedValue(false);

  const toggleFab = () => {
    isExpanded.value = !isExpanded.value;
  };

  const handlePrescriptionPress = () => {
    onPrescriptionPress?.();
    isExpanded.value = false;
  };

  const handleAIChatPress = () => {
    onAIChatPress?.();
    isExpanded.value = false;
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(isExpanded.value ? '0deg' : '0deg', {
            duration: 300,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.fabContainer}>
      {/* Animated Action Buttons */}
      <AnimatedFabButton
        isExpanded={isExpanded}
        index={1}
        icon="add"
        onPress={handlePrescriptionPress}
        label="Write Prescription"
      />
      <AnimatedFabButton
        isExpanded={isExpanded}
        index={2}
        icon="chatbox-ellipses-outline"
        onPress={handleAIChatPress}
        label="View AI Chat History"
      />

      {/* Main FAB Toggle Button */}
      <Pressable onPress={toggleFab} style={styles.mainFabButton}>
        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={isExpanded.value ? 'close' : 'ellipsis-vertical'}
            size={24}
            color={colors.white}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};
