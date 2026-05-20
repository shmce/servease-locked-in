import { StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Card,
  Field,
  PrimaryButton,
  Section,
} from '../../components/DesignKit';
import {
  SupportTicketReplySummary,
  SupportTicketSummary,
} from '../models/types';
import { useSupportPanelViewModel } from '../hooks/useSupportPanelViewModel';
import { palette, radius, spacing, type } from '../../theme/serveaseDesign';

type SupportPanelProps = {
  busyAction: string | null;
  currentUserId: string | null;
  expandedTicketId: string | null;
  isSignedIn: boolean;
  supportMessage: string;
  supportReplies: Record<string, SupportTicketReplySummary[]>;
  supportReplyDraft: string;
  supportSubject: string;
  supportTickets: SupportTicketSummary[];
  onMessageChange: (value: string) => void;
  onOpenTicket: () => void;
  onReplyDraftChange: (value: string) => void;
  onSubmitReply: (ticketId: string) => void;
  onSubjectChange: (value: string) => void;
  onToggleTicket: (ticketId: string) => void;
};

export function SupportPanel({
  busyAction,
  currentUserId,
  expandedTicketId,
  isSignedIn,
  supportMessage,
  supportReplies,
  supportReplyDraft,
  supportSubject,
  supportTickets,
  onMessageChange,
  onOpenTicket,
  onReplyDraftChange,
  onSubmitReply,
  onSubjectChange,
  onToggleTicket,
}: SupportPanelProps) {
  const supportPanel = useSupportPanelViewModel({
    busyAction,
    currentUserId,
    expandedTicketId,
    supportReplies,
    supportTickets,
  });
  const { data } = supportPanel;

  return (
    <Section title="Support">
      <Field
        label="Subject"
        value={supportSubject}
        onChangeText={onSubjectChange}
        placeholder="How can we help?"
      />
      <Field
        label="Message"
        value={supportMessage}
        onChangeText={onMessageChange}
        multiline
      />
      <PrimaryButton
        label="Open support ticket"
        variant="secondary"
        onPress={onOpenTicket}
        disabled={!isSignedIn || !data.canOpenTicket}
      />
      {data.ticketRows.map((ticket) => (
        <Card key={ticket.id} onPress={() => onToggleTicket(ticket.id)}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{ticket.subject}</Text>
              <Text style={styles.cardMeta}>{ticket.summary}</Text>
              {ticket.attachmentLabel ? (
                <Text style={styles.noticeText}>{ticket.attachmentLabel}</Text>
              ) : null}
            </View>
            <Badge label={ticket.statusLabel} tone={ticket.statusTone} />
          </View>
          {ticket.isExpanded ? (
            <View style={styles.supportRepliesBlock}>
              {ticket.replyRows.length === 0 ? (
                <Text style={styles.noticeText}>
                  No replies yet. Support will reply here.
                </Text>
              ) : (
                ticket.replyRows.map((reply) => (
                  <View
                    key={reply.id}
                    style={[
                      styles.messageBubble,
                      reply.isMine && styles.messageBubbleMine,
                    ]}
                  >
                    <Text style={styles.cardMeta}>
                      {reply.authorLabel} - {reply.createdAtLabel}
                    </Text>
                    <Text style={styles.cardBody}>{reply.message}</Text>
                  </View>
                ))
              )}
              {ticket.canReply ? (
                <>
                  <Field
                    label="Your reply"
                    value={supportReplyDraft}
                    onChangeText={onReplyDraftChange}
                    placeholder="Share more details for support"
                    multiline
                  />
                  <PrimaryButton
                    label={ticket.replyButtonLabel}
                    onPress={() => onSubmitReply(ticket.id)}
                    disabled={!supportReplyDraft.trim() || ticket.isReplyDisabled}
                  />
                </>
              ) : (
                <Text style={styles.noticeText}>{ticket.closedLabel}</Text>
              )}
            </View>
          ) : null}
        </Card>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  supportRepliesBlock: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: radius.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
    maxWidth: '86%',
    padding: spacing.md,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: palette.mintSoft,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
});
