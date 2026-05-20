import { useMemo } from 'react';
import { BookingSummary } from '../../../shared/models/types';

export type BookingFilter = 'active' | 'completed';

export function useBookingsViewModel({
  bookings,
  bookingFilter,
}: {
  bookings: BookingSummary[];
  bookingFilter: BookingFilter;
}) {
  const data = useMemo(() => {
    const visibleBookings = bookings.filter((booking) =>
      bookingFilter === 'completed'
        ? booking.status === 'completed'
        : booking.status !== 'completed' &&
          booking.status !== 'cancelled' &&
          booking.status !== 'rejected',
    );

    return {
      visibleBookings,
      isEmpty: visibleBookings.length === 0,
    };
  }, [bookingFilter, bookings]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
