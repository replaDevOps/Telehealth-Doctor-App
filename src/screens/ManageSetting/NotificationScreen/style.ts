import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';
import { mvs } from '@config/metrices';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: mvs(16),
    paddingVertical: mvs(16),
    backgroundColor: colors.white,
  },
  notificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    marginRight: mvs(12),
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: mvs(4),
    borderRadius: mvs(8),
  },
  contentContainer: {
    flex: 1,
    marginRight: mvs(12),
  },
  title: {
    fontSize: mvs(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: mvs(4),
  },
  titleUnread: {
    fontWeight: '700',
  },
  message: {
    fontSize: mvs(14),
    color: colors.text,
    lineHeight: mvs(20),
    marginBottom: mvs(8),
  },
  time: {
    fontSize: mvs(12),
    color: colors.secondaryText,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: mvs(8),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(24),
    paddingVertical: mvs(128),
  },
  loadingText: {
    marginTop: mvs(12),
    fontSize: mvs(14),
    color: colors.secondaryText,
  },
  emptyTitle: {
    fontSize: mvs(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: mvs(16),
    marginBottom: mvs(8),
  },
  emptyMessage: {
    fontSize: mvs(14),
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: mvs(20),
  },
  clearAllContainer: {
    paddingHorizontal: mvs(16),
    paddingVertical: mvs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: mvs(12),
    paddingVertical: mvs(8),
    gap: mvs(6),
  },
  clearAllText: {
    color: colors.primary,
    fontSize: mvs(14),
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mvs(8),
  },
});

