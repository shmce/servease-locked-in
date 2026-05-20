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
} from '../../../shared/models/types';

export type ProviderBookingDetailAction =
  | 'confirm'
  | 'decline'
  | 'startNavigation'
  | 'startService'
  | 'cancel'
  | 'continueService'
  | 'completeService'
  | 'viewReceipt'
  | 'reportIssue';

type ProviderBookingDetailViewModelInput = {
  booking: BookingSummary;
  busyAction: string | null;
  selectedPayment: PaymentSummary | null;
};

type ProviderStatusActionRow = {
  action: ProviderBookingDetailAction;
  disabled?: boolean;
  key: string;
  label: string;
  variant?: 'secondary' | 'danger';
};

export function useProviderBookingDetailViewModel({
  booking,
  busyAction,
  selectedPayment,
}: ProviderBookingDetailViewModelInput) {
  return useMemo(
    () =>
      buildProviderBookingDetailViewModel({
        booking,
        busyAction,
        selectedPayment,
      }),
    [booking, busyAction, selectedPayment],
  );
}

export function buildProviderBookingDetailViewModel({
  booking,
  busyAction,
  selectedPayment,
}: ProviderBookingDetailViewModelInput) {
  const serviceDetailRows = [
    {
      key: 'schedule',
      label: 'Schedule',
      value: formatDateTime(booking.scheduledAt),
    },
    {
      key: 'location',
      label: 'Location',
      value: booking.serviceAddress ?? 'Address unavailable',
    },
    {
      key: 'service',
      label: 'Service',
      value: booking.serviceTitle ?? 'Service booking',
    },
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
  const estimatedEarningsLabel = formatMoney(
    selectedPayment?.providerPayout ?? booking.totalAmount,
  );

  return {
    data: {
      addressLabel: booking.serviceAddress ?? 'Address unavailable',
      bookingReference: booking.bookingReference,
      customerName:
        booking.customerFullName ?? booking.customerId.slice(0, 8).toUpperCase(),
      estimatedEarningsLabel,
      serviceDetailRows,
      serviceTitle: booking.serviceTitle ?? 'Service booking',
      statusActions: buildStatusActions(booking, busyAction, selectedPayment),
      statusChip: bookingStatusChip(booking.status),
      timelineSteps: timelineForStatus(booking.status),
    },
    isLoading: false,
    error: null,
  };
}

function buildStatusActions(
  booking: BookingSummary,
  busyAction: string | null,
  selectedPayment: PaymentSummary | null,
): ProviderStatusActionRow[] {
  const completionBlockedByPayment =
    selectedPayment?.paymentMethod &&
    selectedPayment.paymentMethod !== 'cash_on_service' &&
    selectedPayment.status !== 'paid';

  switch (booking.status) {
    case 'pending':
      return [
        {
          action: 'confirm',
          disabled: busyAction === 'booking-confirmed',
          key: 'confirm',
          label: 'Confirm Booking',
        },
        {
          action: 'decline',
          disabled: busyAction === 'booking-rejected',
          key: 'decline',
          label: 'Decline Request',
          variant: 'danger',
        },
      ];
    case 'confirmed':
      return [
        {
          action: 'startNavigation',
          key: 'start-navigation',
          label: 'Start Navigation',
        },
        {
          action: 'startService',
          key: 'start-service',
          label: 'Start Service',
          variant: 'secondary',
        },
        {
          action: 'cancel',
          key: 'cancel',
          label: 'Cancel Booking',
          variant: 'danger',
        },
      ];
    case 'in_progress':
      return [
        {
          action: 'continueService',
          key: 'continue-service',
          label: 'Continue Service',
        },
        {
          action: 'completeService',
          disabled:
            busyAction === 'service-complete' || Boolean(completionBlockedByPayment),
          key: 'complete-service',
          label: completionBlockedByPayment
            ? 'Awaiting Payment'
            : 'Complete Service',
          variant: 'secondary',
        },
        {
          action: 'reportIssue',
          key: 'report-issue',
          label: 'Report Issue',
          variant: 'danger',
        },
      ];
    case 'completed':
      return [
        {
          action: 'viewReceipt',
          key: 'view-receipt',
          label: 'View Receipt',
        },
        {
          action: 'reportIssue',
          key: 'report-issue',
          label: 'Report Issue',
          variant: 'secondary',
        },
      ];
    default:
      return [];
  }
}
