
import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Service } from '../../../types/chat.types';
import { styles } from './style';

interface SuggestionProps {
  suggestions: Service[];
  handleServicePress?: (service: Service) => void;
}

export const Suggestion: React.FC<SuggestionProps> = ({
  suggestions,
  handleServicePress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionsContainer}
    >
      {suggestions.map(service => {
        const rawName = service.serviceName ?? '';
        const displayName = rawName
          ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
          : '';

        return (
          <TouchableOpacity
            key={`${service.category ?? 'service'}-${service.id}`}
            style={styles.suggestionCard}
            onPress={() => handleServicePress?.(service)}
            activeOpacity={handleServicePress ? 0.85 : 1}
          >
            <Image source={service.image} style={styles.suggestionImage} />
            <View style={styles.suggestionContent}>
              <Text
                style={styles.suggestionTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayName}
              </Text>
              <Text style={styles.categoryTagText}>
                {service.category === 'device' ? 'Device' : 'Service'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
