import { useMemo } from 'react';
import { formatDateTime } from '../../../shared/utils/booking';
import { BookingSummary } from '../../../shared/models/types';

export type ProviderStartChecklistKey =
  | 'scopeConfirmed'
  | 'toolsReady'
  | 'instructionsReviewed';

export type ProviderStartChecklistState = Record<ProviderStartChecklistKey, boolean>;

type ProviderStartServiceViewModelInput = {
  booking: BookingSummary;
  checklist: ProviderStartChecklistState;
  beforePhotoUri: string | null;
  beforePhotoUrl: string | null;
  busyAction: string | null;
};

export function useProviderStartServiceViewModel({
  booking,
  checklist,
  beforePhotoUri,
  beforePhotoUrl,
  busyAction,
}: ProviderStartServiceViewModelInput) {
  return useMemo(
    () =>
      buildProviderStartServiceViewModel({
        booking,
        checklist,
        beforePhotoUri,
        beforePhotoUrl,
        busyAction,
      }),
    [beforePhotoUri, beforePhotoUrl, booking, busyAction, checklist],
  );
}

export function buildProviderStartServiceViewModel({
  booking,
  checklist,
  beforePhotoUri,
  beforePhotoUrl,
  busyAction,
}: ProviderStartServiceViewModelInput) {
  const canStart = Object.values(checklist).every(Boolean);

  return {
    data: {
      addressLabel: booking.serviceAddress ?? 'Address unavailable',
      beforePhotoActionLabel: beforePhotoUri
        ? 'Replace starting condition photo'
        : 'Add starting condition photo',
      bookingReference: booking.bookingReference,
      canStart,
      checklistRows: [
        {
          key: 'scopeConfirmed' as const,
          label: 'Scope confirmed with customer',
          checked: checklist.scopeConfirmed,
        },
        {
          key: 'toolsReady' as const,
          label: 'Tools and materials ready',
          checked: checklist.toolsReady,
        },
        {
          key: 'instructionsReviewed' as const,
          label: 'Special instructions reviewed',
          checked: checklist.instructionsReviewed,
        },
      ],
      scheduleLabel: formatDateTime(booking.scheduledAt),
      serviceTitle: booking.serviceTitle ?? 'Service booking',
      startDisabled: !canStart || busyAction === 'booking-in_progress',
      startingConditionUploaded: Boolean(beforePhotoUrl),
    },
    isLoading: false,
    error: null,
  };
}
