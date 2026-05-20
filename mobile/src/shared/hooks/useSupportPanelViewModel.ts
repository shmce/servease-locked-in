import { useMemo } from 'react';
import {
  SupportTicketReplySummary,
  SupportTicketSummary,
} from '../models/types';
import { formatDateTime } from '../utils/booking';

type SupportPanelViewModelInput = {
  busyAction: string | null;
  currentUserId: string | null;
  expandedTicketId: string | null;
  supportReplies: Record<string, SupportTicketReplySummary[]>;
  supportTickets: SupportTicketSummary[];
};

export function useSupportPanelViewModel({
  busyAction,
  currentUserId,
  expandedTicketId,
  supportReplies,
  supportTickets,
}: SupportPanelViewModelInput) {
  return useMemo(
    () =>
      buildSupportPanelViewModel({
        busyAction,
        currentUserId,
        expandedTicketId,
        supportReplies,
        supportTickets,
      }),
    [busyAction, currentUserId, expandedTicketId, supportReplies, supportTickets],
  );
}

export function buildSupportPanelViewModel({
  busyAction,
  currentUserId,
  expandedTicketId,
  supportReplies,
  supportTickets,
}: SupportPanelViewModelInput) {
  const ticketRows = supportTickets.slice(0, 5).map((ticket) => {
    const replies = supportReplies[ticket.id] ?? [];
    const isExpanded = expandedTicketId === ticket.id;
    const canReply = ticket.status !== 'closed' && ticket.status !== 'resolved';

    return {
      id: ticket.id,
      attachmentLabel: ticket.attachments?.length
        ? `${ticket.attachments.length} evidence file${
            ticket.attachments.length === 1 ? '' : 's'
          } attached`
        : null,
      canReply,
      closedLabel: `This ticket is ${ticket.status}. Open a new ticket for further help.`,
      isExpanded,
      isReplyDisabled: busyAction === `support-reply-${ticket.id}`,
      replyButtonLabel:
        busyAction === `support-reply-${ticket.id}` ? 'Sending...' : 'Send reply',
      replyRows: replies.map((reply) => {
        const mine = reply.repliedBy === currentUserId;
        const createdAtLabel = reply.createdAt ? formatDateTime(reply.createdAt) : '';

        return {
          id: reply.id,
          authorLabel: mine ? 'You' : 'Support',
          createdAtLabel,
          isMine: mine,
          message: reply.message,
        };
      }),
      statusLabel: ticket.status.replace('_', ' '),
      statusTone: ticket.status === 'resolved' ? 'success' as const : 'warning' as const,
      subject: ticket.subject,
      summary: ticket.message ?? ticket.category ?? 'Support ticket',
    };
  });

  return {
    data: {
      canOpenTicket: busyAction !== 'support',
      ticketRows,
    },
    isLoading: false,
    error: null,
  };
}
