import { useEffect, useRef } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Paperclip, Send } from 'lucide-react-native';
import { EmptyState, TopBar } from '../../../components/DesignKit';
import { AppRole } from '../../../navigation/types';
import {
  ApiOptions,
  BookingSummary,
  ConversationMessage,
  ConversationSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useMessagesViewModel } from '../viewModels/useMessagesViewModel';

type MessagesScreenProps = {
  apiOptions: ApiOptions;
  appRole: AppRole;
  bookings: BookingSummary[];
  busyAction: string | null;
  conversations: ConversationSummary[];
  hasSession: boolean;
  messageDraft: string;
  messages: ConversationMessage[];
  selectedConversationId: string | null;
  onAttachImage: () => Promise<void>;
  onDeselectConversation: () => void;
  onMessageDraftChange: (message: string) => void;
  onMessagesLoaded: (messages: ConversationMessage[]) => void;
  onNotice: (notice: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onSendMessage: () => Promise<void>;
};

export function MessagesScreen({
  apiOptions,
  appRole,
  bookings,
  busyAction,
  conversations,
  hasSession,
  messageDraft,
  messages,
  selectedConversationId,
  onAttachImage,
  onDeselectConversation,
  onMessageDraftChange,
  onMessagesLoaded,
  onNotice,
  onSelectConversation,
  onSendMessage,
}: MessagesScreenProps) {
  const messagesViewModel = useMessagesViewModel({
    apiOptions,
    appRole,
    bookings,
    busyAction,
    conversations,
    hasSession,
    messages,
    selectedConversationId,
    onMessagesLoaded,
    onNotice,
    onSelectConversation,
  });
  const { data } = messagesViewModel;

  if (selectedConversationId) {
    return (
      <ChatDetailScreen
        data={data}
        messageDraft={messageDraft}
        onAttachImage={onAttachImage}
        onBack={onDeselectConversation}
        onMessageDraftChange={onMessageDraftChange}
        onSendMessage={onSendMessage}
      />
    );
  }

  return (
    <ConversationListScreen
      data={data}
      onSelectConversation={(id) => void messagesViewModel.selectConversation(id)}
    />
  );
}

// ─── Conversation list ────────────────────────────────────────────────────────

function ConversationListScreen({
  data,
  onSelectConversation,
}: {
  data: ReturnType<typeof useMessagesViewModel>['data'];
  onSelectConversation: (id: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <TopBar title="Messages" />
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data.conversationRows.map((row, index) => (
          <Pressable
            key={row.conversation.id}
            style={[
              styles.convoRow,
              index < data.conversationRows.length - 1 && styles.convoRowBorder,
            ]}
            onPress={() => onSelectConversation(row.conversation.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open conversation with ${row.counterparty}`}
          >
            <View style={styles.convoAvatar}>
              <Text style={styles.convoInitial}>{row.initial}</Text>
            </View>
            <View style={styles.convoBody}>
              <Text style={styles.convoName} numberOfLines={1}>
                {row.counterparty}
              </Text>
              <Text style={styles.convoService} numberOfLines={1}>
                {row.serviceName}
              </Text>
            </View>
            <Text style={styles.convoTime} numberOfLines={1}>
              {row.timeLabel}
            </Text>
          </Pressable>
        ))}
        {!data.hasConversations ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No conversations yet"
              body="Start chatting from a booking detail."
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Chat detail ──────────────────────────────────────────────────────────────

function ChatDetailScreen({
  data,
  messageDraft,
  onAttachImage,
  onBack,
  onMessageDraftChange,
  onSendMessage,
}: {
  data: ReturnType<typeof useMessagesViewModel>['data'];
  messageDraft: string;
  onAttachImage: () => Promise<void>;
  onBack: () => void;
  onMessageDraftChange: (message: string) => void;
  onSendMessage: () => Promise<void>;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [data.messageRows.length]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar
        title={data.threadTitle}
        subtitle={data.threadSubtitle}
        onBack={onBack}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {data.messageRows.length === 0 ? (
          <View style={styles.chatEmpty}>
            <Text style={styles.chatEmptyText}>{data.threadEmptyLabel}</Text>
          </View>
        ) : null}

        {data.messageRows.map((row) => (
          <View
            key={row.message.id}
            style={[styles.bubbleWrap, row.isMine ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}
          >
            {!row.isMine ? (
              <Text style={styles.bubbleSender}>{row.senderLabel}</Text>
            ) : null}

            {row.message.attachment ? (
              <Image
                source={{ uri: row.message.attachment.fileUrl }}
                style={[
                  styles.bubbleImage,
                  row.isMine ? styles.bubbleImageRight : styles.bubbleImageLeft,
                ]}
              />
            ) : null}

            {row.message.content ? (
              <View style={[styles.bubble, row.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={row.isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
                  {row.message.content}
                </Text>
              </View>
            ) : null}

            {row.sentAtLabel ? (
              <Text style={[styles.bubbleTime, row.isMine && styles.bubbleTimeRight]}>
                {row.sentAtLabel}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <Pressable
          onPress={() => void onAttachImage()}
          disabled={data.attachDisabled}
          style={[styles.inputAction, data.attachDisabled && styles.inputActionDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Attach image"
        >
          <Paperclip color={palette.mint} size={20} strokeWidth={2.2} />
        </Pressable>

        <TextInput
          style={styles.inputField}
          value={messageDraft}
          onChangeText={onMessageDraftChange}
          placeholder="Type a message..."
          placeholderTextColor={palette.faint}
          multiline
          maxLength={1000}
        />

        <Pressable
          onPress={() => void onSendMessage()}
          disabled={data.sendDisabled}
          style={[styles.sendButton, data.sendDisabled && styles.sendButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Send
            color={data.sendDisabled ? palette.faint : palette.white}
            size={18}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
    flex: 1,
  },

  // Conversation list
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 108,
  },
  convoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  convoRowBorder: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  convoAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  convoInitial: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
  },
  convoBody: {
    flex: 1,
    gap: 2,
  },
  convoName: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  convoService: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  convoTime: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 80,
    textAlign: 'right',
  },
  emptyWrap: {
    padding: spacing.lg,
  },

  // Chat
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.base,
    paddingBottom: spacing.lg,
  },
  chatEmpty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  chatEmptyText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
  },

  // Bubbles
  bubbleWrap: {
    gap: 3,
    maxWidth: '78%',
  },
  bubbleWrapLeft: {
    alignSelf: 'flex-start',
  },
  bubbleWrapRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleSender: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 1,
    paddingLeft: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    backgroundColor: palette.mint,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: palette.lineSoft,
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  bubbleTextTheirs: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  bubbleImage: {
    borderRadius: radius.md,
    height: 160,
    width: 220,
  },
  bubbleImageRight: {
    alignSelf: 'flex-end',
  },
  bubbleImageLeft: {
    alignSelf: 'flex-start',
  },
  bubbleTime: {
    color: palette.faint,
    fontSize: 10,
    fontWeight: '500',
    paddingLeft: 4,
  },
  bubbleTimeRight: {
    paddingLeft: 0,
    paddingRight: 4,
    textAlign: 'right',
  },

  // Input bar
  inputBar: {
    alignItems: 'flex-end',
    backgroundColor: palette.white,
    borderTopColor: palette.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingBottom: spacing.base,
  },
  inputAction: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  inputActionDisabled: {
    opacity: 0.4,
  },
  inputField: {
    backgroundColor: palette.cream,
    borderRadius: radius.pill,
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    maxHeight: 100,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButtonDisabled: {
    backgroundColor: palette.line,
  },
});
