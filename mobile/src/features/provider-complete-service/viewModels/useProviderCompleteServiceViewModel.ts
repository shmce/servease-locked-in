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
  const isCashPayment = payment?.paymentMethod === 'cash_on_service';
  const isOnlinePayment = Boolean(payment?.paymentMethod && !isCashPayment);
  const isOnlinePaymentBlocked = isOnlinePayment && payment?.status !== 'paid';
  const paymentStatusLabel = payment
    ? isCashPayment && payment.status === 'pending'
      ? 'Cash due on service'
      : payment.status === 'paid'
        ? 'Paid'
        : `Payment ${payment.status}`
    : 'No payment record';
  const providerPayoutLabel = payment
    ? formatMoney(payment.providerPayout)
    : 'Payout pending';
  const platformFeeLabel = payment ? formatMoney(payment.platformFee) : 'Pending';
  const paymentNotice = isOnlinePaymentBlocked
    ? 'Customer online payment is still pending. Refresh the booking after the customer completes checkout.'
    : isCashPayment && payment?.status === 'pending'
      ? 'Cash collection will be marked paid when completion succeeds.'
      : payment?.status === 'paid'
        ? 'Payment is ready for service completion.'
        : 'Payment record is not loaded. The backend will verify payment before completion.';

  return {
    data: {
      bookingReference: booking.bookingReference,
      completionPhotoActionLabel: completionPhotoUri
        ? 'Replace completion photo'
        : 'Add completion photo',
      completionPhotoUploaded: Boolean(completionPhotoUrl),
      paymentNotice,
      paymentStatusLabel,
      submitDisabled:
        busyAction === 'service-complete' || isOnlinePaymentBlocked,
      submitLabel:
        busyAction === 'service-complete'
          ? 'Completing...'
          : isOnlinePaymentBlocked
            ? 'Awaiting payment'
            : 'Mark as Completed',
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
          value: providerPayoutLabel,
        },
        {
          key: 'platform-fee',
          label: 'Platform fee',
          value: platformFeeLabel,
        },
        {
          key: 'payment-status',
          label: 'Payment status',
          value: paymentStatusLabel,
        },
      ],
    },
    isLoading: false,
    error: null,
  };
}
