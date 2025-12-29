import { StyleSheet } from 'react-native';
import { mvs } from '../../../config/metrices';
import { colors } from '../../../styles/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
  },
  sectionHeader: {
    marginTop: mvs(25),
    marginBottom: mvs(10),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,  
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 18,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  dayOffText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  workingTimeText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  dayOffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});