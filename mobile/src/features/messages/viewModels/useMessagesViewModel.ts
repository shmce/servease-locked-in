import { useCallback, useMemo, useState } from 'react';
import {
  ApiOptions,
  BookingSummary,
  ConversationMessage,
  ConversationSummary,
} from '../../../shared/models/types';
import {
  listConversationMessages,
} from '../../../shared/models/apiService';
import { AppRole } from '../../../navigation/types';
import {
  formatDateTime,
  roleLabel,
} from '../../../shared/utils/booking';
import { readError } from '../../../navigation/routeHelpers';

type UseMessagesViewModelInput = {
  apiOptions: ApiOptions;
  appRole: AppRole;
  bookings: BookingSummary[];
  busyAction: string | null;
  conversations: ConversationSummary[];
  hasSession: boolean;
  messages: ConversationMessage[];
  selectedConversationId: string | null;
  onMessagesLoaded: (messages: ConversationMessage[]) => void;
  onNotice: (notice: string) => void;
  onSelectConversation: (conversationId: string) => void;
};

export function useMessagesViewModel({
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
}: UseMessagesViewModelInput) {
  const [isLoading, setIsLoading] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const conversationByBookingId = useMemo(() => {
    const bookingMap = new Map<string, BookingSummary>();
    bookings.forEach((booking) => bookingMap.set(booking.id, booking));
    return bookingMap;
  }, [bookings]);

  const conversationRows = useMemo(
    () =>
      conversations.map((conversation) => {
        const booking = conversation.bookingId
          ? conversationByBookingId.get(conversation.bookingId)
          : undefined;
        const serviceName = booking?.serviceTitle ?? 'Booking conversation';
        const counterparty =
          conversationCounterpartyName(appRole, conversation, booking) ?? serviceName;
        return {
          conversation,
          counterparty,
          initial: counterparty.slice(0, 1).toUpperCase(),
          serviceName,
          timeLabel: conversation.lastMessageAt
            ? formatDateTime(conversation.lastMessageAt)
            : '',
          meta: `${booking?.bookingReference ?? 'Unlinked booking'} - ${
            conversation.lastMessageAt
              ? formatDateTime(conversation.lastMessageAt)
              : 'No messages yet'
          }`,
          selected: conversation.id === selectedConversationId,
          title: conversationTitle(appRole, conversation, booking),
        };
      }),
    [appRole, conversationByBookingId, conversations, selectedConversationId],
  );

  const selectedConversationBooking = selectedConversation?.bookingId
    ? conversationByBookingId.get(selectedConversation.bookingId)
    : undefined;

  const messageRows = useMemo(
    () =>
      messages.slice(-20).map((message) => ({
        isMine: message.senderRole === appRole,
        message,
        senderLabel: messageSenderLabel(
          appRole,
          message.senderRole,
          selectedConversation,
          selectedConversationBooking,
        ),
        sentAtLabel: message.createdAt ? formatDateTime(message.createdAt) : null,
      })),
    [appRole, messages, selectedConversation, selectedConversationBooking],
  );

  const selectConversation = useCallback(
    async (conversationId: string) => {
      onSelectConversation(conversationId);
      setIsLoading(true);
      try {
        onMessagesLoaded(await listConversationMessages(conversationId, apiOptions));
      } catch (error) {
        onNotice(readError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [apiOptions, onMessagesLoaded, onNotice, onSelectConversation],
  );

  const threadTitle =
    conversationCounterpartyName(
      appRole,
      selectedConversation,
      selectedConversationBooking,
    ) ?? 'Conversation';
  const threadSubtitle = selectedConversationBooking?.serviceTitle ?? '';

  return {
    data: {
      attachDisabled: !hasSession || busyAction === 'upload-message_attachment',
      attachLabel:
        busyAction === 'upload-message_attachment' ? 'Uploading...' : 'Attach image',
      conversationRows,
      hasConversations: conversationRows.length > 0,
      messageRows,
      sendDisabled: !hasSession || busyAction === 'send-message',
      threadEmptyLabel: selectedConversationId
        ? 'Say hi to start the conversation.'
        : 'Pick a conversation to start chatting.',
      threadTitle,
      threadSubtitle,
    },
    isLoading,
    error: null,
    selectConversation,
  };
}

function conversationTitle(
  appRole: AppRole,
  conversation: ConversationSummary,
  booking?: BookingSummary,
): string {
  const serviceTitle = booking?.serviceTitle ?? 'Booking conversation';
  const counterparty = conversationCounterpartyName(appRole, conversation, booking);
  return counterparty ? `${serviceTitle} - ${counterparty}` : serviceTitle;
}

function messageSenderLabel(
  appRole: AppRole,
  senderRole: AppRole,
  selectedConversation?: ConversationSummary,
  selectedConversationBooking?: BookingSummary,
): string {
  if (senderRole === appRole) {
    return 'You';
  }

  return (
    conversationCounterpartyName(
      appRole,
      selectedConversation,
      selectedConversationBooking,
    ) ?? roleLabel(senderRole)
  );
}

function conversationCounterpartyName(
  appRole: AppRole,
  conversation?: ConversationSummary,
  booking?: BookingSummary,
): string | null {
  if (appRole === 'provider') {
    return booking?.customerFullName ?? conversation?.customerId?.slice(0, 8) ?? null;
  }

  return (
    booking?.providerBusinessName ??
    booking?.bookingReference ??
    conversation?.bookingId?.slice(0, 8) ??
    null
  );
}
