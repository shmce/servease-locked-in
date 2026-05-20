import { useMemo } from 'react';
import { formatDateTime } from '../../../shared/utils/booking';
import {
  BookingSummary,
  BookingTimelineEventSummary,
} from '../../../shared/models/types';

type ProviderServiceInProgressViewModelInput = {
  booking: BookingSummary;
  timelineEvents: BookingTimelineEventSummary[];
  nowTick: number;
  progressMessage: string;
  progressPhotoUri: string | null;
  progressPhotoUrl: string | null;
  busyAction: string | null;
};

export function useProviderServiceInProgressViewModel({
  booking,
  timelineEvents,
  nowTick,
  progressMessage,
  progressPhotoUri,
  progressPhotoUrl,
  busyAction,
}: ProviderServiceInProgressViewModelInput) {
  return useMemo(
    () =>
      buildProviderServiceInProgressViewModel({
        booking,
        timelineEvents,
        nowTick,
        progressMessage,
        progressPhotoUri,
        progressPhotoUrl,
        busyAction,
      }),
    [
      booking,
      busyAction,
      nowTick,
      progressMessage,
      progressPhotoUri,
      progressPhotoUrl,
      timelineEvents,
    ],
  );
}

export function buildProviderServiceInProgressViewModel({
  booking,
  timelineEvents,
  nowTick,
  progressMessage,
  progressPhotoUri,
  progressPhotoUrl,
  busyAction,
}: ProviderServiceInProgressViewModelInput) {
  const startedAt = serviceStartedAt(booking, timelineEvents);

  return {
    data: {
      addressLabel: booking.serviceAddress ?? 'Address unavailable',
      bookingReference: booking.bookingReference,
      canSendProgressUpdate:
        Boolean(progressMessage.trim()) && busyAction !== 'service-progress',
      progressPhotoActionLabel: progressPhotoUri
        ? 'Replace progress photo'
        : 'Add progress photo',
      progressPhotoUploaded: Boolean(progressPhotoUrl),
      serviceTitle: booking.serviceTitle ?? 'Service booking',
      startedAtLabel: startedAt
        ? `Started ${formatDateTime(startedAt.toISOString())}`
        : 'Service timer starts when work begins.',
      timerLabel: formatElapsedTime(startedAt ? nowTick - startedAt.getTime() : 0),
    },
    isLoading: false,
    error: null,
  };
}

function serviceStartedAt(
  booking: BookingSummary,
  events: BookingTimelineEventSummary[],
): Date | null {
  const startEvent = events.find((event) => {
    return (
      event.eventType === 'status_changed' &&
      (event.label ?? '').toLowerCase().includes('in_progress') &&
      event.createdAt
    );
  });
  const value = startEvent?.createdAt ?? booking.scheduledAt;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
