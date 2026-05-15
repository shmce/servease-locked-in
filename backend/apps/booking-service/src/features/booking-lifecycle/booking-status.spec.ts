import { assertBookingTransition } from './booking-status';
import { InvalidBookingTransitionError } from './booking.errors';

describe('assertBookingTransition', () => {
  it('allows expected booking status transitions', () => {
    expect(() => assertBookingTransition('pending', 'confirmed')).not.toThrow();
    expect(() => assertBookingTransition('confirmed', 'in_progress')).not.toThrow();
    expect(() => assertBookingTransition('in_progress', 'completed')).not.toThrow();
  });

  it('rejects invalid booking status transitions', () => {
    expect(() => assertBookingTransition('completed', 'pending')).toThrow(
      InvalidBookingTransitionError,
    );
    expect(() => assertBookingTransition('pending', 'completed')).toThrow(
      InvalidBookingTransitionError,
    );
  });
});
