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
    paddingVertical: mvs(14),
    backgroundColor: colors.white,
  },
  notificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    marginRight: mvs(12),
    borderWidth: 1,
    borderColor: colors.border,
    padding: mvs(4),
    borderRadius: mvs(8),
    // Fixed box so the bell, the title and the delete button share one top line
    // regardless of how many lines the message wraps to.
    width: mvs(30),
    height: mvs(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginRight: mvs(8),
    minHeight: mvs(30),
    justifyContent: 'center',
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
  },
  deleteButton: {
    width: mvs(30),
    height: mvs(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(24),
    // No vertical padding: this box is already flex-centred, and the old mvs(128)
    // top+bottom pushed the icon and copy off-screen on shorter iPhones.
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
    // Top-aligned to match the row's flex-start content, so the delete button no
    // longer floats to the middle of a long, multi-line message.
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: mvs(30),
    gap: mvs(6),
  },
});

