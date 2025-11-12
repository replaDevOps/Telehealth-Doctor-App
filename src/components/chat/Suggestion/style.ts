import { colors } from '../../../styles/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  suggestionCard: {
    width: '45%',
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  suggestionImage: {
    width: 40,
    height: 40,
  },
  suggestionContent: {
    flex: 1,
    marginLeft:5
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  suggestionSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionSubtitle: {
    fontSize: 10,
    color: colors.white,
    flex: 1,
  },
});
