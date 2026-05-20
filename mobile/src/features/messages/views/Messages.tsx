import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  EmptyState,
  Field,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { AppRole } from '../../../navigation/types';
import {
  ApiOptions,
  BookingSummary,
  ConversationMessage,
  ConversationSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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

  return (
    <>
      <TopBar title="Messages" subtitle="Conversations stay attached to bookings" />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section title="Conversations">
            {data.conversationRows.map((row) => (
              <Card
                key={row.conversation.id}
                selected={row.selected}
                onPress={() => void messagesViewModel.selectConversation(row.conversation.id)}
              >
                <Text style={styles.cardTitle}>{row.title}</Text>
                <Text style={styles.cardMeta}>{row.meta}</Text>
              </Card>
            ))}
            {data.hasConversations ? null : (
              <EmptyState
                title="No conversations"
                body="Open messages from a booking."
              />
            )}
          </Section>
          <Section title="Thread">
            <Card>
              {data.messageRows.map((row) => (
                <View
                  key={row.message.id}
                  style={[
                    styles.messageBubble,
                    row.isMine && styles.messageBubbleMine,
                  ]}
                >
                  <Text style={styles.cardMeta}>
                    {row.senderLabel}
                    {row.sentAtLabel ? ` - ${row.sentAtLabel}` : ''}
                  </Text>
                  {row.message.attachment ? (
                    <Image
                      source={{ uri: row.message.attachment.fileUrl }}
                      style={styles.uploadPreview}
                    />
                  ) : null}
                  {row.message.content ? (
                    <Text style={styles.cardBody}>{row.message.content}</Text>
                  ) : null}
                </View>
              ))}
              {!data.messageRows.length ? (
                <Text style={styles.cardMeta}>{data.threadEmptyLabel}</Text>
              ) : null}
            </Card>
            <Field
              label="Message"
              value={messageDraft}
              onChangeText={onMessageDraftChange}
              multiline
            />
            <View style={styles.twoButtons}>
              <PrimaryButton
                label={data.attachLabel}
                variant="secondary"
                onPress={() => void onAttachImage()}
                disabled={data.attachDisabled}
              />
              <PrimaryButton
                label="Send"
                onPress={() => void onSendMessage()}
                disabled={data.sendDisabled}
              />
            </View>
          </Section>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: palette.lineSoft,
    borderRadius: radius.lg,
    gap: spacing.xs,
    maxWidth: '86%',
    padding: spacing.md,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: palette.mintSoft,
  },
  uploadPreview: {
    borderRadius: radius.md,
    height: 116,
    width: '100%',
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
});
