import { useMemo } from 'react';
import {
  BookingSummary,
  PaymentSummary,
  ProviderListing,
} from '../../../shared/models/types';
import {
  formatDateTime,
  formatMoney,
} from '../../../shared/utils/booking';
import { timelineForStatus } from '../../../navigation/routeHelpers';

export function useCustomerBookingConfirmationViewModel({
  selectedBooking,
  selectedProvider,
  selectedPayment,
}: {
  selectedBooking: BookingSummary | null;
  selectedProvider: ProviderListing | null | undefined;
  selectedPayment: PaymentSummary | null;
}) {
  const data = useMemo(() => {
    if (!selectedBooking) {
      return {
        hasBooking: false,
        bookingReference: '',
        providerInitial: 'S',
        providerName: 'Assigned service provider',
        providerRatingLabel: 'Provider details',
        canViewProvider: false,
        scheduledAtLabel: '',
        locationLabel: '',
        costLabel: '',
        bookedForLabel: '',
        statusSteps: [],
        isPaymentReserved: Boolean(selectedPayment),
      };
    }

    const scheduledAtLabel = formatDateTime(selectedBooking.scheduledAt);
    const providerName =
      selectedProvider?.providerBusinessName ?? 'Assigned service provider';

    return {
      hasBooking: true,
      bookingReference: selectedBooking.bookingReference,
      providerInitial: providerName.slice(0, 1),
      providerName,
      providerRatingLabel: selectedProvider
        ? `${selectedProvider.averageRating.toFixed(1)} rating`
        : 'Provider details',
      canViewProvider: Boolean(selectedProvider),
      scheduledAtLabel,
      locationLabel: selectedBooking.serviceAddress ?? 'Address unavailable',
      costLabel: formatMoney(selectedBooking.totalAmount),
      bookedForLabel: `You booked this service for ${scheduledAtLabel}.`,
      statusSteps: timelineForStatus(selectedBooking.status),
      isPaymentReserved: Boolean(selectedPayment),
    };
  }, [selectedBooking, selectedPayment, selectedProvider]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
