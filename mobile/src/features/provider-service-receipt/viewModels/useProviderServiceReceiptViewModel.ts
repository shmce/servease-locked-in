import { useMemo } from 'react';
import {
  formatDateTime,
  formatMoney,
  statusLabel,
} from '../../../shared/utils/booking';
import {
  BookingSummary,
  PaymentSummary,
} from '../../../shared/models/types';

type ProviderServiceReceiptViewModelInput = {
  booking: BookingSummary;
  payment: PaymentSummary | null;
};

export function useProviderServiceReceiptViewModel({
  booking,
  payment,
}: ProviderServiceReceiptViewModelInput) {
  return useMemo(
    () =>
      buildProviderServiceReceiptViewModel({
        booking,
        payment,
      }),
    [booking, payment],
  );
}

export function buildProviderServiceReceiptViewModel({
  booking,
  payment,
}: ProviderServiceReceiptViewModelInput) {
  return {
    data: {
      bookingReference: booking.bookingReference,
      providerPayoutLabel: payment
        ? formatMoney(payment.providerPayout)
        : 'Payout pending',
      receiptRows: [
        {
          key: 'schedule',
          label: 'Schedule',
          value: formatDateTime(booking.scheduledAt),
        },
        {
          key: 'status',
          label: 'Booking status',
          value: statusLabel(booking.status),
        },
        {
          key: 'customerPaid',
          label: 'Customer paid',
          value: formatMoney(booking.totalAmount),
        },
        {
          key: 'platformFee',
          label: 'Platform fee',
          value: payment ? formatMoney(payment.platformFee) : 'Pending',
        },
        {
          key: 'providerPayout',
          label: 'Provider payout',
          value: payment ? formatMoney(payment.providerPayout) : 'Payout pending',
        },
      ],
      serviceTitle: booking.serviceTitle ?? 'Service booking',
    },
    isLoading: false,
    error: null,
  };
}
