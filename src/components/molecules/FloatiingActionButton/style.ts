import { mvs } from '@config/metrices';
import {  StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';


export const styles = StyleSheet.create({

   // New FAB Styles - Vertical Layout
   fabContainer: {
    alignItems: 'center',
  },
  mainFabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabButton: {
    height: 48,
    width:200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: "flex-start",
    position: 'absolute',
    bottom: 10,
    right: 0,
    left:-15,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 48,
  },
  fabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fabIconContainer: {
    width: mvs(46),
    height: mvs(46),
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    padding:8,
    backgroundColor:colors.white,
    borderRadius:8,
    overflow:"hidden"
  },
});
