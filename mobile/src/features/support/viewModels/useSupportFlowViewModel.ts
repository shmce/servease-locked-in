import { useCallback, useState } from 'react';
import { readError } from '../../../navigation/routeHelpers';
import type { RouteState } from '../../../navigation/types';
import {
  createSupportTicket,
  createSupportTicketReply,
  listSupportTicketReplies,
  raiseBookingDispute,
} from '../../../shared/models/apiService';
import type {
  ApiOptions,
  BookingSummary,
  SupportTicketReplySummary,
  SupportTicketSummary,
  UploadSummary,
} from '../../../shared/models/types';

type SupportFlowViewModelInput = {
  apiOptions: ApiOptions;
  hasSession: boolean;
  selectedBooking: BookingSummary | null;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
  setRoute: (route: RouteState) => void;
};

export function useSupportFlowViewModel({
  apiOptions,
  hasSession,
  selectedBooking,
  setBusyAction,
  setNotice,
  setRoute,
}: SupportFlowViewModelInput) {
  const [supportTickets, setSupportTickets] = useState<SupportTicketSummary[]>([]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [expandedSupportTicketId, setExpandedSupportTicketId] = useState<
    string | null
  >(null);
  const [supportReplies, setSupportReplies] = useState<
    Record<string, SupportTicketReplySummary[]>
  >({});
  const [supportReplyDraft, setSupportReplyDraft] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [reportEvidencePhotoUri, setReportEvidencePhotoUri] = useState<string | null>(
    null,
  );
  const [reportEvidencePhotoUrl, setReportEvidencePhotoUrl] = useState<string | null>(
    null,
  );
  const [reportEvidenceUpload, setReportEvidenceUpload] =
    useState<UploadSummary | null>(null);
  const [providerReportReason, setProviderReportReason] = useState('');
  const [providerReportDetails, setProviderReportDetails] = useState('');

  const clearReportEvidence = useCallback(() => {
    setReportEvidencePhotoUri(null);
    setReportEvidencePhotoUrl(null);
    setReportEvidenceUpload(null);
  }, []);

  const supportAttachments = useCallback(
    () => (reportEvidenceUpload ? [mediaAttachmentFromUpload(reportEvidenceUpload)] : []),
    [reportEvidenceUpload],
  );

  const submitSupportTicket = useCallback(
    async (
      subject = supportSubject,
      body = supportMessage,
      attachments = supportAttachments(),
    ) => {
      if (!subject.trim()) {
        setNotice('Enter a support subject.');
        return false;
      }

      setBusyAction('support');
      try {
        const ticket = await createSupportTicket(
          {
            subject: subject.trim(),
            message: body.trim() || null,
            category: 'booking',
            attachments,
          },
          apiOptions,
        );
        setSupportTickets((current) => [ticket, ...current]);
        setSupportSubject('');
        setSupportMessage('');
        clearReportEvidence();
        setNotice('Support ticket opened.');
        return true;
      } catch (error) {
        setNotice(readError(error));
        return false;
      } finally {
        setBusyAction(null);
      }
    },
    [
      apiOptions,
      clearReportEvidence,
      setBusyAction,
      setNotice,
      supportAttachments,
      supportMessage,
      supportSubject,
    ],
  );

  const raiseSelectedBookingDispute = useCallback(
    async (category: string, reason: string, description?: string | null) => {
      if (!selectedBooking) {
        setNotice('Select a booking first.');
        return null;
      }

      return raiseBookingDispute(
        selectedBooking.id,
        {
          category,
          reason,
          description: description?.trim() || null,
        },
        apiOptions,
      );
    },
    [apiOptions, selectedBooking, setNotice],
  );

  const submitCustomerIssue = useCallback(async () => {
    const subject = supportSubject.trim();
    const body = supportMessage.trim();

    if (!subject || !body || !desiredResolution) {
      setNotice('Choose an issue type, description, and desired resolution.');
      return;
    }

    setBusyAction('dispute');
    try {
      const dispute = await raiseSelectedBookingDispute(
        subject,
        body,
        `Desired resolution: ${desiredResolution}`,
      );
      await submitSupportTicket(
        subject,
        [
          body,
          `Desired resolution: ${desiredResolution}`,
          dispute ? `Dispute: ${dispute.id}` : null,
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
      setDesiredResolution('');
      setRoute({ role: 'customer', screen: 'customerBookingDetail' });
      setNotice('Dispute submitted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }, [
    desiredResolution,
    raiseSelectedBookingDispute,
    setBusyAction,
    setNotice,
    setRoute,
    submitSupportTicket,
    supportMessage,
    supportSubject,
  ]);

  const submitProviderIssue = useCallback(async () => {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }
    const reason = providerReportReason.trim();
    const details = providerReportDetails.trim();
    if (!reason || !details) {
      setNotice('Enter the issue subject and details.');
      return;
    }

    setBusyAction('dispute');
    try {
      const dispute = await raiseSelectedBookingDispute(reason, details);
      await submitSupportTicket(
        reason,
        [
          `Booking: ${selectedBooking.bookingReference}`,
          details,
          `Dispute: ${dispute?.id}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        supportAttachments(),
      );
      setProviderReportReason('');
      setProviderReportDetails('');
      clearReportEvidence();
      setRoute({ role: 'provider', screen: 'providerBookingDetail' });
      setNotice('Dispute submitted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }, [
    clearReportEvidence,
    providerReportDetails,
    providerReportReason,
    raiseSelectedBookingDispute,
    selectedBooking,
    setBusyAction,
    setNotice,
    setRoute,
    submitSupportTicket,
    supportAttachments,
  ]);

  const loadSupportTicketReplies = useCallback(
    async (ticketId: string) => {
      if (!hasSession) {
        return;
      }
      try {
        const replies = await listSupportTicketReplies(ticketId, apiOptions);
        setSupportReplies((current) => ({ ...current, [ticketId]: replies }));
      } catch (error) {
        setNotice(readError(error));
      }
    },
    [apiOptions, hasSession, setNotice],
  );

  const toggleSupportTicket = useCallback(
    (ticketId: string) => {
      if (expandedSupportTicketId === ticketId) {
        setExpandedSupportTicketId(null);
        return;
      }
      setExpandedSupportTicketId(ticketId);
      setSupportReplyDraft('');
      if (!supportReplies[ticketId]) {
        void loadSupportTicketReplies(ticketId);
      }
    },
    [expandedSupportTicketId, loadSupportTicketReplies, supportReplies],
  );

  const submitSupportReply = useCallback(
    async (ticketId: string) => {
      const message = supportReplyDraft.trim();
      if (!message || !hasSession) {
        return;
      }
      setBusyAction(`support-reply-${ticketId}`);
      try {
        const reply = await createSupportTicketReply(ticketId, message, apiOptions);
        setSupportReplies((current) => {
          const existing = current[ticketId] ?? [];
          return { ...current, [ticketId]: [...existing, reply] };
        });
        setSupportReplyDraft('');
        setNotice('Reply sent.');
      } catch (error) {
        setNotice(readError(error));
      } finally {
        setBusyAction(null);
      }
    },
    [apiOptions, hasSession, setBusyAction, setNotice, supportReplyDraft],
  );

  const openTicketFromNotification = useCallback(
    (ticketId: string) => {
      setExpandedSupportTicketId(ticketId);
      setSupportReplyDraft('');
      if (!supportReplies[ticketId]) {
        void loadSupportTicketReplies(ticketId);
      }
    },
    [loadSupportTicketReplies, supportReplies],
  );

  return {
    data: {
      desiredResolution,
      expandedSupportTicketId,
      providerReportDetails,
      providerReportReason,
      reportEvidencePhotoUri,
      reportEvidencePhotoUrl,
      supportMessage,
      supportReplies,
      supportReplyDraft,
      supportSubject,
      supportTickets,
    },
    actions: {
      clear: () => {
        setSupportTickets([]);
        setSupportReplies({});
        setExpandedSupportTicketId(null);
        setSupportReplyDraft('');
        setSupportSubject('');
        setSupportMessage('');
        setDesiredResolution('');
        setProviderReportReason('');
        setProviderReportDetails('');
        clearReportEvidence();
      },
      openTicketFromNotification,
      replaceTickets: setSupportTickets,
      setDesiredResolution,
      setProviderReportDetails,
      setProviderReportReason,
      setReportEvidenceUploadResult: (uri: string, upload: UploadSummary) => {
        setReportEvidencePhotoUri(uri);
        setReportEvidencePhotoUrl(upload.publicUrl);
        setReportEvidenceUpload(upload);
      },
      setSupportMessage,
      setSupportReplyDraft,
      setSupportSubject,
      submitCustomerIssue,
      submitProviderIssue,
      submitSupportReply,
      submitSupportTicket,
      toggleSupportTicket,
    },
    isLoading: false,
    error: null,
  };
}

function mediaAttachmentFromUpload(upload: UploadSummary) {
  return {
    fileUrl: upload.publicUrl,
    fileName: upload.path.split('/').pop() ?? null,
    mimeType: upload.contentType,
    storagePath: upload.path,
    fileSize: upload.size,
    caption: null,
  };
}
