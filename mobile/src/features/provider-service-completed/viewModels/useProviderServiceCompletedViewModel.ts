import { useMemo } from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';

type ProviderServiceCompletedViewModelInput = {
  booking: BookingSummary;
  payment: PaymentSummary | null;
};

export function useProviderServiceCompletedViewModel({
  booking,
  payment,
}: ProviderServiceCompletedViewModelInput) {
  return useMemo(
    () =>
      buildProviderServiceCompletedViewModel({
        booking,
        payment,
      }),
    [booking, payment],
  );
}

export function buildProviderServiceCompletedViewModel({
  booking,
  payment,
}: ProviderServiceCompletedViewModelInput) {
  return {
    data: {
      bookingReference: booking.bookingReference,
      earningsLabel: formatMoney(payment?.providerPayout ?? booking.totalAmount),
      serviceTitle: booking.serviceTitle ?? 'Service booking',
    },
    isLoading: false,
    error: null,
  };
}
