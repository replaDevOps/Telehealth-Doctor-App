
import { colors } from '../../../styles/colors';
import {
    StyleSheet,
  } from 'react-native';

export const styles = StyleSheet.create({
    headerWrapper: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
    doctorHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      },
      doctorHeaderCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 12,
        minWidth: 0,
      },
      doctorName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
      },
      consultationTime: {
        fontSize: 13,
        color: colors.secondaryText,
        marginTop: 2,
      },
      endButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 64,
        alignItems: 'center',
      },
      endButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
      },
      endButtonSpacer: {
        minWidth: 64,
      },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        // paddingRight: 4,
        borderTopWidth: 1,
        borderTopColor: colors.border2,
        backgroundColor: colors.white,
        position: 'relative',
      },
      patientInfoRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
      },
      patientAvatarWrapper: {
        marginRight: 12,
      },
      patientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.lightGray,
      },
      patientTextBlock: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
      },
      patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
      },
      patientDemographics: {
        fontSize: 13,
        color: colors.secondaryText,
        marginTop: 2,
      },
      chatHistoryButton: {
        backgroundColor: colors.gray,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        // marginLeft: 8,
      },
      chatHistoryButtonText: {
        fontSize: 13,
        color: colors.secondaryText,
        fontWeight: '500',
      },
      zIconButton: {
        position: 'absolute',
        top: 12,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.neutral,
        justifyContent: 'center',
        alignItems: 'center',
      },
      zIconText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700',
      },
});
