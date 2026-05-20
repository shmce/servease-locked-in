import { useMemo } from 'react';
import { timelineForStatus } from '../../../navigation/routeHelpers';
import {
  bookingStatusChip,
  formatBookingDuration,
  formatDateTime,
  formatMoney,
  pricingModeLabel,
} from '../../../shared/utils/booking';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
} from '../../../shared/models/types';

type CustomerBookingDetailViewModelInput = {
  booking: BookingSummary;
  selectedProvider: ProviderListing | null;
  selectedPayment: PaymentSummary | null;
};

export function useCustomerBookingDetailViewModel({
  booking,
  selectedProvider,
  selectedPayment,
}: CustomerBookingDetailViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingDetailViewModel({
        booking,
        selectedProvider,
        selectedPayment,
      }),
    [booking, selectedPayment, selectedProvider],
  );
}

export function buildCustomerBookingDetailViewModel({
  booking,
  selectedProvider,
  selectedPayment,
}: CustomerBookingDetailViewModelInput) {
  const serviceDetailRows = [
    {
      key: 'description',
      label: 'Description',
      value:
        booking.serviceDescription?.trim() ||
        'No additional description provided.',
    },
    {
      key: 'instructions',
      label: 'Special instructions',
      value: booking.customerNotes?.trim() || 'None',
    },
    {
      key: 'duration',
      label: 'Estimated duration',
      value: formatBookingDuration(booking.hoursRequired),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      value: pricingModeLabel(booking.pricingMode),
    },
  ];
  const paymentSummary = selectedPayment
    ? {
        label:
          selectedPayment.status === 'paid'
            ? 'Paid'
            : `Payment ${selectedPayment.status}`,
        value: formatMoney(selectedPayment.amount),
      }
    : null;

  return {
    data: {
      addressLabel: booking.serviceAddress ?? 'Address unavailable',
      bookingReference: booking.bookingReference,
      canViewProviderProfile: Boolean(selectedProvider),
      paymentSummary,
      providerName:
        booking.providerBusinessName ??
        selectedProvider?.providerBusinessName ??
        'Provider details unavailable',
      reservePaymentDisabled: Boolean(selectedPayment),
      reservePaymentLabel: selectedPayment ? 'Payment reserved' : 'Reserve payment',
      scheduleLabel: `The service provider will start - ${formatDateTime(
        booking.scheduledAt,
      )}`,
      serviceDetailRows,
      serviceTitle: booking.serviceTitle ?? 'Service booking',
      showPaymentSummary: booking.status === 'completed' && Boolean(paymentSummary),
      showReservePayment: booking.status !== 'completed',
      showReviewPanel: booking.status === 'completed',
      showTrackProvider: ['confirmed', 'in_progress'].includes(booking.status),
      statusChip: bookingStatusChip(booking.status),
      timelineSteps: timelineForStatus(booking.status),
      totalAmountLabel: formatMoney(booking.totalAmount),
    },
    isLoading: false,
    error: null,
  };
}
