import { useMemo } from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';

type ProviderCompleteServiceViewModelInput = {
  booking: BookingSummary;
  busyAction: string | null;
  completionPhotoUri: string | null;
  completionPhotoUrl: string | null;
  payment: PaymentSummary | null;
};

export function useProviderCompleteServiceViewModel({
  booking,
  busyAction,
  completionPhotoUri,
  completionPhotoUrl,
  payment,
}: ProviderCompleteServiceViewModelInput) {
  return useMemo(
    () =>
      buildProviderCompleteServiceViewModel({
        booking,
        busyAction,
        completionPhotoUri,
        completionPhotoUrl,
        payment,
      }),
    [booking, busyAction, completionPhotoUri, completionPhotoUrl, payment],
  );
}

export function buildProviderCompleteServiceViewModel({
  booking,
  busyAction,
  completionPhotoUri,
  completionPhotoUrl,
  payment,
}: ProviderCompleteServiceViewModelInput) {
  return {
    data: {
      bookingReference: booking.bookingReference,
      completionPhotoActionLabel: completionPhotoUri
        ? 'Replace completion photo'
        : 'Add completion photo',
      completionPhotoUploaded: Boolean(completionPhotoUrl),
      submitDisabled: busyAction === 'booking-completed',
      summaryRows: [
        {
          key: 'service',
          label: 'Service',
          value: booking.serviceTitle ?? 'Service booking',
        },
        {
          key: 'customer-total',
          label: 'Customer total',
          value: formatMoney(booking.totalAmount),
        },
        {
          key: 'provider-payout',
          label: 'Provider payout',
          value: formatMoney(payment?.providerPayout ?? booking.totalAmount),
        },
      ],
    },
    isLoading: false,
    error: null,
  };
}
