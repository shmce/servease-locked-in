import { ProviderBookingTab } from '../constants/appContent';
import { BookingSummary } from '../shared/models/types';

export function filterProviderBookings(
  bookings: BookingSummary[],
  tab: ProviderBookingTab,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return bookings
    .filter((booking) => {
      if (tab === 'upcoming') {
        return booking.status === 'pending' || booking.status === 'confirmed';
      }
      if (tab === 'inProgress') {
        return booking.status === 'in_progress';
      }
      if (tab === 'completed') {
        return booking.status === 'completed';
      }
      return booking.status === 'cancelled' || booking.status === 'rejected';
    })
    .filter((booking) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        booking.bookingReference,
        booking.serviceTitle ?? '',
        booking.serviceAddress ?? '',
        booking.customerId,
        booking.customerFullName ?? '',
        booking.customerContactNumber ?? '',
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
}
