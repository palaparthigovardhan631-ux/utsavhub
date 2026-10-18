// ==============================================================================
// UTSAVHUB REAL-TIME CHAT SCREEN
// In-App Messaging Per Booking Lead Linked via Real-Time WebSocket Subscriptions
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { ChatMessage } from '../../types';
import {
  getBookingMessages,
  sendChatMessage,
  subscribeToChatMessages,
} from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

interface ChatScreenProps {
  route: any;
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { bookingId, counterpartyName } = route.params;
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  const flatListRef = useRef<FlatList>(null);
  const currentUserId = user?.id || profile?.id || 'client_user_123';

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      const res = await getBookingMessages(bookingId);
      setMessages(res.data);
      setIsLoading(false);
    };

    loadMessages();

    // Subscribe to live WebSocket messages for this booking lead
    const unsubscribe = subscribeToChatMessages(bookingId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [bookingId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    const res = await sendChatMessage(bookingId, currentUserId, text);
    setIsSending(false);

    if (res.data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data!.id)) {
          return prev;
        }
        return [...prev, res.data!];
      });
    }
  };

  const renderMessageBubble = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === currentUserId;
    const timeFormatted = item.created_at
      ? new Date(item.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowThem,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextThem,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeTextMe : styles.timeTextThem,
            ]}
          >
            {timeFormatted}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Top Chat Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <View style={styles.navInfo}>
            <Text style={styles.navTitle} numberOfLines={1}>
              {counterpartyName || 'Event Partner'}
            </Text>
            <View style={styles.onlineStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Live Synchronized Chat</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Syncing live messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageBubble}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>Start your discussion</Text>
                <Text style={styles.emptySub}>
                  Discuss menu items, timings, decor specifications, and payment terms.
                </Text>
              </View>
            }
          />
        )}

        {/* Bottom Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            multiline
            style={styles.textInput}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  navInfo: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextMe: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageTextThem: {
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.75)',
  },
  timeTextThem: {
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
