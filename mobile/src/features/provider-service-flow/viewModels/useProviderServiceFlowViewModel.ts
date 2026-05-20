import { useCallback, useState } from 'react';
import { readError } from '../../../navigation/routeHelpers';
import type { ProviderStartChecklistState } from '../../provider-start-service/viewModels/useProviderStartServiceViewModel';
import {
  createBookingAttachment,
  createBookingServiceUpdate,
  transitionBookingStatus,
} from '../../../shared/models/apiService';
import type {
  ApiOptions,
  BookingServiceUpdateSummary,
  BookingSummary,
  PaymentSummary,
  UploadSummary,
} from '../../../shared/models/types';

type ProviderPhotoKind = 'before' | 'progress' | 'completion';

type UploadProviderJobPhoto = (
  onUploaded: (uri: string, upload: UploadSummary) => void | Promise<void>,
) => Promise<void>;

type ProviderServiceFlowViewModelInput = {
  apiOptions: ApiOptions;
  onBookingUpdated: (booking: BookingSummary) => void;
  onPaymentsRefresh: () => Promise<void>;
  onRefreshBookingTimelineEvents: (bookingId: string) => void;
  onRefreshBookingTracking: (bookingId: string) => void;
  onServiceUpdateCreated: (update: BookingServiceUpdateSummary) => void;
  selectedBooking: BookingSummary | null;
  selectedPayment: PaymentSummary | null;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
  setProviderRoute: (
    screen:
      | 'providerServiceInProgress'
      | 'providerServiceCompleted',
  ) => void;
  uploadProviderJobPhoto: UploadProviderJobPhoto;
};

export function useProviderServiceFlowViewModel({
  apiOptions,
  onBookingUpdated,
  onPaymentsRefresh,
  onRefreshBookingTimelineEvents,
  onRefreshBookingTracking,
  onServiceUpdateCreated,
  selectedBooking,
  selectedPayment,
  setBusyAction,
  setNotice,
  setProviderRoute,
  uploadProviderJobPhoto,
}: ProviderServiceFlowViewModelInput) {
  const [providerChecklist, setProviderChecklist] =
    useState<ProviderStartChecklistState>({
      scopeConfirmed: false,
      toolsReady: false,
      instructionsReviewed: false,
    });
  const [providerPhotoCaption, setProviderPhotoCaption] = useState('');
  const [providerBeforePhotoUri, setProviderBeforePhotoUri] = useState<string | null>(
    null,
  );
  const [providerBeforePhotoUrl, setProviderBeforePhotoUrl] = useState<string | null>(
    null,
  );
  const [providerProgressPhotoUri, setProviderProgressPhotoUri] = useState<
    string | null
  >(null);
  const [providerProgressPhotoUrl, setProviderProgressPhotoUrl] = useState<
    string | null
  >(null);
  const [providerCompletionPhotoUri, setProviderCompletionPhotoUri] = useState<
    string | null
  >(null);
  const [providerCompletionPhotoUrl, setProviderCompletionPhotoUrl] = useState<
    string | null
  >(null);
  const [providerProgressMessage, setProviderProgressMessage] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const startSelectedService = useCallback(async () => {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    setBusyAction('service-start');
    try {
      const update = await createBookingServiceUpdate(
        selectedBooking.id,
        {
          updateType: 'checklist',
          message:
            providerPhotoCaption.trim() || 'Pre-service checklist completed.',
          checklist: providerChecklist,
        },
        apiOptions,
      );
      onServiceUpdateCreated(update);
      if (selectedBooking.status !== 'in_progress') {
        const updated = await transitionBookingStatus(
          selectedBooking.id,
          {
            currentStatus: selectedBooking.status,
            nextStatus: 'in_progress',
          },
          apiOptions,
        );
        onBookingUpdated(updated);
        onRefreshBookingTracking(updated.id);
        onRefreshBookingTimelineEvents(updated.id);
      }
      setNotice('Service started.');
      setProviderRoute('providerServiceInProgress');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }, [
    apiOptions,
    onBookingUpdated,
    onRefreshBookingTimelineEvents,
    onRefreshBookingTracking,
    onServiceUpdateCreated,
    providerChecklist,
    providerPhotoCaption,
    selectedBooking,
    setBusyAction,
    setNotice,
    setProviderRoute,
  ]);

  const completeSelectedService = useCallback(async () => {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    if (
      selectedPayment?.paymentMethod &&
      selectedPayment.paymentMethod !== 'cash_on_service' &&
      selectedPayment.status !== 'paid'
    ) {
      setNotice('Customer online payment must be paid before completing service.');
      return;
    }

    setBusyAction('service-complete');
    try {
      const updated = await transitionBookingStatus(
        selectedBooking.id,
        {
          currentStatus: selectedBooking.status,
          nextStatus: 'completed',
        },
        apiOptions,
      );
      onBookingUpdated(updated);
      onRefreshBookingTracking(updated.id);
      const update = await createBookingServiceUpdate(
        updated.id,
        {
          updateType: 'completion',
          message: completionNotes.trim() || 'Service marked completed.',
        },
        apiOptions,
      );
      onServiceUpdateCreated(update);
      onRefreshBookingTimelineEvents(updated.id);
      await onPaymentsRefresh().catch(() => undefined);
      setCompletionNotes('');
      setNotice('Service completed.');
      setProviderRoute('providerServiceCompleted');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }, [
    apiOptions,
    completionNotes,
    onBookingUpdated,
    onPaymentsRefresh,
    onRefreshBookingTimelineEvents,
    onRefreshBookingTracking,
    onServiceUpdateCreated,
    selectedBooking,
    selectedPayment,
    setBusyAction,
    setNotice,
    setProviderRoute,
  ]);

  const submitProviderProgressUpdate = useCallback(async () => {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    const message = providerProgressMessage.trim();
    if (!message) {
      setNotice('Write a progress update first.');
      return;
    }

    setBusyAction('service-progress');
    try {
      const update = await createBookingServiceUpdate(
        selectedBooking.id,
        {
          updateType: 'progress',
          message,
        },
        apiOptions,
      );
      onServiceUpdateCreated(update);
      setProviderProgressMessage('');
      setNotice('Progress update sent.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }, [
    apiOptions,
    onServiceUpdateCreated,
    providerProgressMessage,
    selectedBooking,
    setBusyAction,
    setNotice,
  ]);

  const pickProviderPhoto = useCallback(
    async (kind: ProviderPhotoKind) => {
      if (!selectedBooking) {
        setNotice('Select a booking before attaching job photos.');
        return;
      }

      await uploadProviderJobPhoto(async (uri, uploaded) => {
        const attachment = await createBookingAttachment(
          selectedBooking.id,
          {
            ...mediaAttachmentFromUpload(uploaded, providerPhotoCaption),
            mediaKind: 'provider_progress',
          },
          apiOptions,
        );
        onBookingUpdated({
          ...selectedBooking,
          attachments: [attachment, ...(selectedBooking.attachments ?? [])],
        });
        const update = await createBookingServiceUpdate(
          selectedBooking.id,
          {
            updateType:
              kind === 'before'
                ? 'checklist'
                : kind === 'completion'
                  ? 'completion'
                  : 'progress',
            message:
              kind === 'before'
                ? providerPhotoCaption.trim() ||
                  'Starting condition photo added.'
                : kind === 'completion'
                  ? 'Completion photo added.'
                  : 'Progress photo added.',
            attachmentId: attachment.id,
          },
          apiOptions,
        );
        onServiceUpdateCreated(update);
        if (kind === 'before') {
          setProviderBeforePhotoUri(uri);
          setProviderBeforePhotoUrl(uploaded.publicUrl);
        } else if (kind === 'progress') {
          setProviderProgressPhotoUri(uri);
          setProviderProgressPhotoUrl(uploaded.publicUrl);
        } else {
          setProviderCompletionPhotoUri(uri);
          setProviderCompletionPhotoUrl(uploaded.publicUrl);
        }
      });
    },
    [
      apiOptions,
      onBookingUpdated,
      onServiceUpdateCreated,
      providerPhotoCaption,
      selectedBooking,
      setNotice,
      uploadProviderJobPhoto,
    ],
  );

  return {
    data: {
      completionNotes,
      providerBeforePhotoUri,
      providerBeforePhotoUrl,
      providerChecklist,
      providerCompletionPhotoUri,
      providerCompletionPhotoUrl,
      providerPhotoCaption,
      providerProgressMessage,
      providerProgressPhotoUri,
      providerProgressPhotoUrl,
    },
    actions: {
      clear: () => {
        setProviderChecklist({
          scopeConfirmed: false,
          toolsReady: false,
          instructionsReviewed: false,
        });
        setProviderPhotoCaption('');
        setProviderBeforePhotoUri(null);
        setProviderBeforePhotoUrl(null);
        setProviderProgressPhotoUri(null);
        setProviderProgressPhotoUrl(null);
        setProviderCompletionPhotoUri(null);
        setProviderCompletionPhotoUrl(null);
        setProviderProgressMessage('');
        setCompletionNotes('');
      },
      completeSelectedService,
      pickProviderPhoto,
      setCompletionNotes,
      setProviderPhotoCaption,
      setProviderProgressMessage,
      startSelectedService,
      submitProviderProgressUpdate,
      toggleChecklist: (key: keyof ProviderStartChecklistState) =>
        setProviderChecklist((current) => ({
          ...current,
          [key]: !current[key],
        })),
    },
    isLoading: false,
    error: null,
  };
}

function mediaAttachmentFromUpload(upload: UploadSummary, caption?: string | null) {
  return {
    fileUrl: upload.publicUrl,
    fileName: upload.path.split('/').pop() ?? null,
    mimeType: upload.contentType,
    storagePath: upload.path,
    fileSize: upload.size,
    caption: caption ?? null,
  };
}
