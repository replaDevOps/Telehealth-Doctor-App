import React from 'react';
import { View, TextInput, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../styles/colors';
import { StyleSheet } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search by patient name',
}: SearchBarProps) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={colors.secondaryText} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={searchQuery}
        onChangeText={onSearchChange}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
});
