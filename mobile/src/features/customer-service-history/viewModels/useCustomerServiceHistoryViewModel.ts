import { useMemo } from 'react';
import { BookingSummary } from '../../../shared/models/types';

export function useCustomerServiceHistoryViewModel({
  bookings,
}: {
  bookings: BookingSummary[];
}) {
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'completed'),
    [bookings],
  );

  return {
    data: {
      completedBookings,
    },
    isLoading: false,
    error: null,
  };
}
