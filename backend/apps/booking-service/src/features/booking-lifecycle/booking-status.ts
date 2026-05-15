import { InvalidBookingTransitionError } from './booking.errors';
import { BookingStatus } from './booking.types';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
};

export function assertBookingTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
): void {
  if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new InvalidBookingTransitionError();
  }
}
