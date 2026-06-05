import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CustomerBadge,
  CustomerCard,
  CustomerSection,
  customerText,
} from './CustomerUI';
import {
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  ProviderEmptyState,
  ProviderSection,
  ProviderTextField,
  providerText,
} from './ProviderUI';
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
  variant?: 'customer';
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
  variant,
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

  if (variant === 'customer') {
    return (
      <CustomerSection title="Contact support">
        <CustomerCard style={styles.customerFormCard}>
          <View style={styles.customerField}>
            <Text style={styles.customerLabel}>Subject</Text>
            <TextInput
              style={styles.customerInput}
              value={supportSubject}
              onChangeText={onSubjectChange}
              placeholder="How can we help?"
              placeholderTextColor="#A7AFB8"
            />
          </View>
          <View style={styles.customerField}>
            <Text style={styles.customerLabel}>Message</Text>
            <TextInput
              style={[styles.customerInput, styles.customerTextarea]}
              value={supportMessage}
              onChangeText={onMessageChange}
              placeholder="Share a few details"
              placeholderTextColor="#A7AFB8"
              multiline
              textAlignVertical="top"
            />
          </View>
          <Pressable
            style={[
              styles.customerButton,
              (!isSignedIn || !data.canOpenTicket) && styles.customerButtonDisabled,
            ]}
            onPress={onOpenTicket}
            disabled={!isSignedIn || !data.canOpenTicket}
            accessibilityRole="button"
          >
            <Text style={styles.customerButtonText}>Open support ticket</Text>
          </Pressable>
        </CustomerCard>

        {data.ticketRows.length ? (
          <View style={styles.customerTicketList}>
            {data.ticketRows.map((ticket) => (
              <CustomerCard
                key={ticket.id}
                onPress={() => onToggleTicket(ticket.id)}
                selected={ticket.isExpanded}
                accessibilityLabel={`Toggle support ticket: ${ticket.subject}`}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.customerTicketTitle} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                    <Text style={styles.customerTicketMeta} numberOfLines={2}>
                      {ticket.summary}
                    </Text>
                    {ticket.attachmentLabel ? (
                      <Text style={styles.customerNoticeText}>
                        {ticket.attachmentLabel}
                      </Text>
                    ) : null}
                  </View>
                  <CustomerBadge label={ticket.statusLabel} tone={ticket.statusTone} />
                </View>
                {ticket.isExpanded ? (
                  <View style={styles.customerRepliesBlock}>
                    {ticket.replyRows.length === 0 ? (
                      <Text style={styles.customerNoticeText}>
                        No replies yet. Support will reply here.
                      </Text>
                    ) : (
                      ticket.replyRows.map((reply) => (
                        <View
                          key={reply.id}
                          style={[
                            styles.customerMessageBubble,
                            reply.isMine && styles.customerMessageBubbleMine,
                          ]}
                        >
                          <Text style={styles.customerTicketMeta}>
                            {reply.authorLabel} - {reply.createdAtLabel}
                          </Text>
                          <Text style={styles.customerMessageBody}>{reply.message}</Text>
                        </View>
                      ))
                    )}
                    {ticket.canReply ? (
                      <>
                        <TextInput
                          style={[styles.customerInput, styles.customerReplyInput]}
                          value={supportReplyDraft}
                          onChangeText={onReplyDraftChange}
                          placeholder="Share more details for support"
                          placeholderTextColor="#A7AFB8"
                          multiline
                          textAlignVertical="top"
                        />
                        <Pressable
                          style={[
                            styles.customerButton,
                            (!supportReplyDraft.trim() || ticket.isReplyDisabled) &&
                              styles.customerButtonDisabled,
                          ]}
                          onPress={() => onSubmitReply(ticket.id)}
                          disabled={!supportReplyDraft.trim() || ticket.isReplyDisabled}
                          accessibilityRole="button"
                        >
                          <Text style={styles.customerButtonText}>
                            {ticket.replyButtonLabel}
                          </Text>
                        </Pressable>
                      </>
                    ) : (
                      <Text style={styles.customerNoticeText}>{ticket.closedLabel}</Text>
                    )}
                  </View>
                ) : null}
              </CustomerCard>
            ))}
          </View>
        ) : null}
      </CustomerSection>
    );
  }

  return (
    <ProviderSection title="Support">
      <ProviderCard>
        <ProviderTextField
          label="Subject"
          value={supportSubject}
          onChangeText={onSubjectChange}
          placeholder="How can we help?"
        />
        <ProviderTextField
          label="Message"
          value={supportMessage}
          onChangeText={onMessageChange}
          placeholder="Share a few details"
          multiline
        />
        <ProviderButton
          label="Open support ticket"
          variant="secondary"
          onPress={onOpenTicket}
          disabled={!isSignedIn || !data.canOpenTicket}
        />
      </ProviderCard>

      {data.ticketRows.length ? (
        <View style={styles.ticketList}>
          {data.ticketRows.map((ticket) => (
            <ProviderCard key={ticket.id} selected={ticket.isExpanded}>
              <Pressable
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
                  <ProviderBadge label={ticket.statusLabel} tone={ticket.statusTone} />
                </View>
              </Pressable>
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
                      <ProviderTextField
                        label="Your reply"
                        value={supportReplyDraft}
                        onChangeText={onReplyDraftChange}
                        placeholder="Share more details for support"
                        multiline
                      />
                      <ProviderButton
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
            </ProviderCard>
          ))}
        </View>
      ) : (
        <ProviderEmptyState
          title="No support tickets"
          body="Open a ticket when you need help with bookings, payouts, or account access."
        />
      )}
    </ProviderSection>
  );
}

const styles = StyleSheet.create({
  customerFormCard: {
    gap: spacing.md,
  },
  customerField: {
    gap: spacing.xs,
  },
  customerLabel: {
    ...customerText.meta,
    color: '#7A828D',
  },
  customerInput: {
    ...customerText.body,
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  customerTextarea: {
    minHeight: 104,
  },
  customerButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  customerButtonDisabled: {
    opacity: 0.45,
  },
  customerButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  customerTicketList: {
    gap: spacing.md,
  },
  customerTicketTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  customerTicketMeta: {
    ...customerText.meta,
    marginTop: 2,
  },
  customerNoticeText: {
    ...customerText.meta,
    color: '#68717E',
    marginTop: spacing.xs,
  },
  customerRepliesBlock: {
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  customerMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.xs,
    maxWidth: '88%',
    padding: spacing.md,
  },
  customerMessageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
  },
  customerMessageBody: {
    ...customerText.body,
  },
  customerReplyInput: {
    minHeight: 92,
  },
  ticketList: {
    gap: spacing.sm,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
    minWidth: 0,
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
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  cardBody: {
    ...providerText.body,
  },
  cardMeta: {
    ...providerText.meta,
  },
  noticeText: {
    ...providerText.meta,
    color: '#68717E',
    marginTop: spacing.xs,
  },
});
