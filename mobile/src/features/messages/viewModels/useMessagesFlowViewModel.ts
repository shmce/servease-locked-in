import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readError } from '../../../navigation/routeHelpers';
import type { AppRole } from '../../../navigation/types';
import type {
  ApiOptions,
  BookingSummary,
  ConversationMessage,
  ConversationMessageAttachment,
  ConversationSummary,
  UploadSummary,
} from '../../../shared/models/types';
import {
  createConversationMessage,
  listConversationMessages,
  listConversations,
  openConversation,
} from '../../../shared/models/apiService';

type UploadMessageAttachment = (
  onUploaded: (uri: string, upload: UploadSummary) => void | Promise<void>,
) => Promise<void>;

type MessagesFlowViewModelInput = {
  apiOptions: ApiOptions;
  appRole: AppRole;
  hasSession: boolean;
  isMessagesScreen: boolean;
  selectedBooking: BookingSummary | null;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
  setRoute: (route: { role: AppRole; screen: 'messages' }) => void;
  uploadMessageAttachment: UploadMessageAttachment;
};

export function useMessagesFlowViewModel({
  apiOptions,
  appRole,
  hasSession,
  isMessagesScreen,
  selectedBooking,
  setBusyAction,
  setNotice,
  setRoute,
  uploadMessageAttachment,
}: MessagesFlowViewModelInput) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const pollFailureNotified = useRef(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  useEffect(() => {
    if (!hasSession || !isMessagesScreen) {
      return undefined;
    }

    const tick = async () => {
      try {
        const nextConversations = await listConversations(apiOptions);
        setConversations(nextConversations);
        if (selectedConversationId) {
          setMessages(
            await listConversationMessages(selectedConversationId, apiOptions),
          );
        }
        pollFailureNotified.current = false;
      } catch (error) {
        if (!pollFailureNotified.current) {
          setNotice(`Messages could not be refreshed: ${readError(error)}`);
          pollFailureNotified.current = true;
        }
      }
    };

    const interval = setInterval(() => void tick(), 8000);
    return () => clearInterval(interval);
  }, [apiOptions, hasSession, isMessagesScreen, selectedConversationId, setNotice]);

  const replaceConversations = useCallback(
    (nextConversations: ConversationSummary[]) => {
      setConversations(nextConversations);
      setSelectedConversationId(
        (current) => current ?? nextConversations[0]?.id ?? null,
      );
    },
    [],
  );

  const openConversationById = useCallback(
    async (conversationId: string) => {
      setSelectedConversationId(conversationId);
      try {
        setMessages(await listConversationMessages(conversationId, apiOptions));
      } catch (error) {
        setNotice(readError(error));
      }
    },
    [apiOptions, setNotice],
  );

  const openSelectedBookingConversation = useCallback(async () => {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return null;
    }

    setBusyAction('open-conversation');
    try {
      const conversation = await openConversation(selectedBooking.id, apiOptions);
      setConversations((current) => [
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ]);
      setSelectedConversationId(conversation.id);
      setMessages(await listConversationMessages(conversation.id, apiOptions));
      setRoute({ role: appRole, screen: 'messages' });
      setNotice('Conversation opened.');
      return conversation;
    } catch (error) {
      setNotice(readError(error));
      return null;
    } finally {
      setBusyAction(null);
    }
  }, [apiOptions, appRole, selectedBooking, setBusyAction, setNotice, setRoute]);

  const sendMessage = useCallback(
    async (attachment?: ConversationMessageAttachment | null) => {
      const trimmed = messageDraft.trim();
      if (!trimmed && !attachment) {
        setNotice('Write a message or attach an image before sending.');
        return;
      }

      const conversation =
        selectedConversation ??
        conversations.find((item) => item.bookingId === selectedBooking?.id) ??
        (await openSelectedBookingConversation());

      if (!conversation) {
        return;
      }

      setBusyAction('send-message');
      try {
        const message = await createConversationMessage(
          conversation.id,
          trimmed || (attachment ? 'Sent an attachment' : ''),
          attachment ?? null,
          apiOptions,
        );
        setMessages((current) => [...current, message]);
        setMessageDraft('');
        setNotice('Message sent.');
      } catch (error) {
        setNotice(readError(error));
      } finally {
        setBusyAction(null);
      }
    },
    [
      apiOptions,
      conversations,
      messageDraft,
      openSelectedBookingConversation,
      selectedBooking?.id,
      selectedConversation,
      setBusyAction,
      setNotice,
    ],
  );

  const attachAndSendMessageImage = useCallback(async () => {
    await uploadMessageAttachment(async (_uri, uploaded) => {
      await sendMessage({
        fileUrl: uploaded.publicUrl,
        fileName: uploaded.path.split('/').pop() ?? null,
        mimeType: uploaded.contentType,
        storagePath: uploaded.path,
        fileSize: uploaded.size,
      });
    });
  }, [sendMessage, uploadMessageAttachment]);

  return {
    data: {
      conversations,
      messageDraft,
      messages,
      selectedConversationId,
    },
    actions: {
      attachAndSendMessageImage,
      clear: () => {
        setConversations([]);
        setMessages([]);
        setSelectedConversationId(null);
        setMessageDraft('');
      },
      openConversationById,
      openSelectedBookingConversation,
      replaceConversations,
      sendMessage,
      setMessageDraft,
      setMessages,
      setSelectedConversationId,
    },
    isLoading: false,
    error: null,
  };
}
