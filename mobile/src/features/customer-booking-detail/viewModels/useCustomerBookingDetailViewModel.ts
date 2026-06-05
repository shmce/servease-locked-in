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
  ReviewSummary,
} from '../../../shared/models/types';

type CustomerBookingDetailViewModelInput = {
  booking: BookingSummary;
  selectedProvider: ProviderListing | null;
  selectedPayment: PaymentSummary | null;
  showReservePaymentAction?: boolean;
  selectedReview: ReviewSummary | null;
};

export function useCustomerBookingDetailViewModel({
  booking,
  selectedProvider,
  selectedPayment,
  showReservePaymentAction,
  selectedReview,
}: CustomerBookingDetailViewModelInput) {
  return useMemo(
    () =>
      buildCustomerBookingDetailViewModel({
        booking,
        selectedProvider,
        selectedPayment,
        showReservePaymentAction,
        selectedReview,
      }),
    [booking, selectedPayment, selectedReview, selectedProvider, showReservePaymentAction],
  );
}

export function buildCustomerBookingDetailViewModel({
  booking,
  selectedProvider,
  selectedPayment,
  showReservePaymentAction = true,
  selectedReview,
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
            : selectedPayment.paymentMethod === 'cash_on_service'
              ? 'Cash due on service'
              : `Payment ${selectedPayment.status}`,
        value: formatMoney(selectedPayment.amount),
      }
    : null;
  const isOnlinePaymentPending =
    selectedPayment?.status === 'pending' &&
    selectedPayment.paymentMethod !== 'cash_on_service';
  const storedPriceBreakdown = booking.priceBreakdown;
  const priceBreakdownRows = storedPriceBreakdown?.lineItems.length
    ? [
        ...storedPriceBreakdown.lineItems.map((item) => ({
          key: item.code,
          label: item.label,
          value: formatMoney(item.amount),
        })),
        {
          key: 'total',
          label: 'Total',
          value: formatMoney(storedPriceBreakdown.total),
        },
      ]
    : [
        {
          key: 'stored-total',
          label: 'Stored total',
          value: formatMoney(booking.totalAmount),
        },
      ];

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
      priceBreakdownRows,
      reservePaymentDisabled:
        Boolean(selectedPayment) && !isOnlinePaymentPending,
      reservePaymentLabel: selectedPayment
        ? isOnlinePaymentPending
          ? 'Check payment status'
          : selectedPayment.status === 'paid'
            ? 'Payment paid'
            : selectedPayment.paymentMethod === 'cash_on_service'
              ? 'Cash due on service'
              : 'Payment status'
        : 'Settle payment',
      scheduleLabel: `The service provider will start - ${formatDateTime(
        booking.scheduledAt,
      )}`,
      serviceDetailRows,
      serviceTitle: booking.serviceTitle ?? 'Service booking',
      showPaymentSummary:
        booking.status === 'completed' && Boolean(paymentSummary),
      showReservePayment:
        showReservePaymentAction && booking.status !== 'completed',
      showReviewPanel: booking.status === 'completed',
      showReviewSummary: Boolean(selectedReview),
      canReview: booking.status === 'completed' && !selectedReview,
      reviewActionLabel: selectedReview ? 'Review submitted' : 'Leave review',
      showTrackProvider: ['confirmed', 'in_progress'].includes(booking.status),
      statusChip: bookingStatusChip(booking.status),
      timelineSteps: timelineForStatus(booking.status),
      totalAmountLabel: formatMoney(booking.totalAmount),
    },
    isLoading: false,
    error: null,
  };
}
