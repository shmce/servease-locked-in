import type { BookingStatus, BookingSummary } from '../shared/models/types';

const lockedProviderTransitionStatuses = new Set<BookingStatus>([
  'confirmed',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
]);

export function hasBlockingActiveProviderBooking(
  bookings: BookingSummary[],
  selectedBookingId: string | null | undefined,
): boolean {
  return bookings.some(
    (booking) =>
      booking.status === 'in_progress' && booking.id !== selectedBookingId,
  );
}

export function providerOperationalLockBlocksTransition(
  bookings: BookingSummary[],
  selectedBooking: BookingSummary | null | undefined,
  nextStatus: BookingStatus,
): boolean {
  if (
    !selectedBooking ||
    selectedBooking.status === 'in_progress' ||
    selectedBooking.status === nextStatus ||
    !lockedProviderTransitionStatuses.has(nextStatus)
  ) {
    return false;
  }

  return hasBlockingActiveProviderBooking(bookings, selectedBooking.id);
}
