import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import {
  venaAIService,
  VenaAISession,
  VenaAIMessage,
} from '../../../services/venaAI/venaAIService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

interface AiChatHistoryBottomSheetProps {
  visible: boolean;
  patientId?: string | number | null;
  onClose: () => void;
  onSessionPress?: (session: VenaAISession) => void;
}

type ViewMode = 'list' | 'chat';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export const AiChatHistoryBottomSheet: React.FC<AiChatHistoryBottomSheetProps> = ({
  visible,
  patientId,
  onClose,
  onSessionPress,
}) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState<VenaAISession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ViewMode>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VenaAIMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await venaAIService.getPatientSessions(patientId);
      setSessions(data.sessions);
      setTotal(data.total);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const fetchChat = useCallback(async (chatId: string) => {
    setChatLoading(true);
    setChatError(null);
    setMessages([]);
    try {
      const data = await venaAIService.getSessionChat(chatId);
      setMessages(data.messages);
    } catch (e: any) {
      setChatError(e?.message ?? 'Failed to load chat');
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setMode('list');
      setActiveChatId(null);
      setMessages([]);
      setChatError(null);
      fetchSessions();
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSessionPress = (session: VenaAISession) => {
    onSessionPress?.(session);
    setActiveChatId(session.chatId);
    setMode('chat');
    fetchChat(session.chatId);
  };

  const handleHeaderBack = () => {
    if (mode === 'chat') {
      setMode('list');
      setActiveChatId(null);
      setMessages([]);
      setChatError(null);
      return;
    }
    onClose();
  };

  const renderSession = ({ item, index }: { item: VenaAISession; index: number }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      activeOpacity={0.7}
      onPress={() => handleSessionPress(item)}
    >
      <View style={styles.sessionIconWrapper}>
        <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.sessionBody}>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionIndex}>Session #{index + 1}</Text>
          <Text style={styles.sessionDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.lastMessage ? (
          <Text style={styles.sessionLastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        ) : (
          <Text style={styles.sessionNoMessage}>No messages yet</Text>
        )}
        <View style={styles.sessionMeta}>
          <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.secondaryText} />
          <Text style={styles.sessionMetaText}>{item.messageCount} messages</Text>
          {item.lastMessageAt ? (
            <>
              <Text style={styles.sessionMetaDot}>·</Text>
              <Text style={styles.sessionMetaText}>{formatTime(item.lastMessageAt)}</Text>
            </>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} style={styles.sessionChevron} />
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: VenaAIMessage }) => {
    const isUser = item.role === 'user';
    const ts = item.timestamp ?? item.createdAt;
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
          ]}
        >
          <Text style={isUser ? styles.messageTextUser : styles.messageTextAssistant}>
            {item.content}
          </Text>
          {ts ? (
            <Text
              style={[
                styles.messageTimestamp,
                isUser ? styles.messageTimestampUser : styles.messageTimestampAssistant,
              ]}
            >
              {formatTime(ts)}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const headerTitle = mode === 'chat' ? 'Chat With Vena AI' : 'Sessions';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleBar} />

        {/* Floating Close / Back button */}
        <TouchableOpacity onPress={handleHeaderBack} style={styles.closeButton}>
          <Ionicons
            name={mode === 'chat' ? 'chevron-back' : 'close'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{headerTitle}</Text>
          {mode === 'list' && total > 0 && !loading && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{total}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerDivider} />

        {/* Content */}
        {mode === 'list' ? (
          loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchSessions}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No AI Chat History</Text>
              <Text style={styles.emptySubtitle}>Previous AI conversations will appear here.</Text>
            </View>
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={item => item.chatId}
              renderItem={renderSession}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )
        ) : chatLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : chatError ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
            <Text style={styles.errorText}>{chatError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => activeChatId && fetchChat(activeChatId)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No messages</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handleBar: {
    width: 90,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.text,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    minWidth: 26,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border2 ?? colors.border,
    marginVertical: 4,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  sessionChevron: {
    marginLeft: 4,
  },
  sessionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sessionBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  sessionLastMessage: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  sessionNoMessage: {
    fontSize: 13,
    color: colors.border,
    fontStyle: 'italic',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sessionMetaText: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  sessionMetaDot: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  chatContent: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: colors.lightGray,
    borderBottomLeftRadius: 4,
  },
  messageTextUser: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextAssistant: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTimestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  messageTimestampUser: {
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right',
  },
  messageTimestampAssistant: {
    color: colors.secondaryText,
    textAlign: 'left',
  },
});
