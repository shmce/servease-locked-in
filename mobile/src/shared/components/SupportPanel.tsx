import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Field,
  PrimaryButton,
  Section,
} from '../../components/DesignKit';
import {
  SupportTicketReplySummary,
  SupportTicketSummary,
} from '../models/types';
import { useSupportPanelViewModel } from '../hooks/useSupportPanelViewModel';
import { palette, radius, spacing } from '../../theme/serveaseDesign';

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
      <View style={styles.ticketList}>
      {data.ticketRows.map((ticket, index) => (
        <Pressable
          key={ticket.id}
          style={[styles.ticketRow, index > 0 && styles.ticketRowDivider]}
          onPress={() => onToggleTicket(ticket.id)}
          accessibilityRole="button"
        >
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
        </Pressable>
      ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  ticketList: {
    gap: 0,
  },
  ticketRow: {
    paddingVertical: spacing.md,
  },
  ticketRowDivider: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
  },
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
    backgroundColor: palette.lineSoft,
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
    fontSize: 14,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  cardMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  noticeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    textAlign: 'center',
  },
});
