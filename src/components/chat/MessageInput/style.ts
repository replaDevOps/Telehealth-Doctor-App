
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

// Vertical breathing room around the input row. The bottom half is applied in the
// component so the safe-area inset can be animated on top of it.
export const INPUT_BAR_PADDING = 12;

export const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: INPUT_BAR_PADDING,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: colors.white,
        gap: 5,
      },
      preButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      },
      input: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        marginRight: 8,
        borderColor: colors.border,
        borderWidth: 1,
        maxHeight: 100, // Limit input height to prevent excessive expansion
        minHeight: 44, // Minimum height for single line
      },
      sendButton: {
        width: 44,
        height: 44,
        backgroundColor: '#7c3aed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
      },
      sendButtonDisabled:{
        width: 44,
        height: 44,
        backgroundColor: colors.gray,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
      }
});
