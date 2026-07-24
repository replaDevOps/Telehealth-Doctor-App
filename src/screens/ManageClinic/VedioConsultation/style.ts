import { mvs } from '@config/metrices';
import {

    Dimensions,
    StyleSheet,

  } from 'react-native';
  import { colors } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');


export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundImage: {
      flex: 1,
      width: width,
      height: height,
    },
    darkBackground: {
      flex: 1,
      width: width,
      height: height,
      backgroundColor: '#1a1a1a', // Dark background color
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topSection: {
      paddingTop: 20,
      paddingHorizontal: 20,
      width: '100%',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    patientInfoCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionWrapper: {
      position: 'relative',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    floatingActionMenu: {
      position: 'absolute',
      bottom: 100,
      left: 16,
      zIndex: 100,
    },
    moreButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...colors.shadow,
    },
    moreButtonActive: {
      backgroundColor: '#5e1cb8',
    },
    actionMenu: {
      position: 'absolute',
      bottom: 70,
      right: 0,
      alignItems: 'flex-end',
      zIndex: 999,
      elevation: 999,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    actionRowDisabled: {
      opacity: 0.7,
    },
    actionCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 14,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    actionCircleSecondary: {
      backgroundColor: '#22c55e',
    },
    actionLabelBubble: {
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 18,
      minWidth: 160,
      marginRight: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    actionLabelText: {
      color: colors.black,
      fontSize: 12.5,
      fontWeight: '600',
    },
    actionLabelTextDisabled: {
      color: 'rgba(21, 21, 21, 0.55)',
    },
    doctorName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.white,
      marginBottom: 6,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    callStatus: {
      fontSize: 15,
      color: colors.white,
      opacity: 0.95,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    pipContainer: {
      position: 'absolute',
      right: 20,
      bottom: 180,
      width: 120,
      height: 160,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.white,
      backgroundColor: '#000',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    pipImage: {
      width: '100%',
      height: '100%',
    },
    controlsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: mvs(50),
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      gap: 12,
    },
    controlButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButtonActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    endCallButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  });
  