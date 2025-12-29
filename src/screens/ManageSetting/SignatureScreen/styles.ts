import { StyleSheet } from 'react-native';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.white,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
        marginBottom: mvs(15),
    },
    signatureContainer: {
        width: '100%',
        height: mvs(200),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: mvs(30),
    },
    signatureImage: {
        width: '90%',
        height: '90%',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 10,
        fontSize: 14,
        color: '#9CA3AF',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
    },
    updateButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
