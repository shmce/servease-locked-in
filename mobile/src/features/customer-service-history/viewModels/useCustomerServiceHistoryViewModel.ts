import { useMemo } from 'react';
import { BookingSummary } from '../../../shared/models/types';
import { formatDateTime, formatMoney } from '../../../shared/utils/booking';

export type CustomerServiceHistoryRow = {
  amountLabel: string;
  booking: BookingSummary;
  providerLabel: string;
  referenceLabel: string;
  scheduledAtLabel: string;
  title: string;
};

export function useCustomerServiceHistoryViewModel({
  bookings,
}: {
  bookings: BookingSummary[];
}) {
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'completed'),
    [bookings],
  );
  const completedRows = useMemo<CustomerServiceHistoryRow[]>(
    () =>
      completedBookings.map((booking) => ({
        amountLabel: formatMoney(booking.totalAmount),
        booking,
        providerLabel: booking.providerBusinessName ?? 'Service provider',
        referenceLabel: booking.bookingReference,
        scheduledAtLabel: formatDateTime(booking.scheduledAt),
        title: booking.serviceTitle ?? 'Completed service',
      })),
    [completedBookings],
  );

  return {
    data: {
      completedBookings,
      completedRows,
    },
    isLoading: false,
    error: null,
  };
}
