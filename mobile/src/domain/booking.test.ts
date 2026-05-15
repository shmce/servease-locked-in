import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  activeBookingCount,
  bookingStatusChip,
  nextBookingStatuses,
  providerPayoutTotal,
} from './booking';

describe('booking domain helpers', () => {
  it('maps booking statuses to readable chip tones', () => {
    assert.deepEqual(bookingStatusChip('pending'), {
      label: 'pending',
      tone: 'warning',
    });
    assert.deepEqual(bookingStatusChip('cancelled'), {
      label: 'cancelled',
      tone: 'danger',
    });
    assert.deepEqual(bookingStatusChip('completed'), {
      label: 'completed',
      tone: 'success',
    });
  });

  it('keeps next actions role-aware', () => {
    assert.deepEqual(nextBookingStatuses('pending', 'provider'), [
      'confirmed',
      'rejected',
    ]);
    assert.deepEqual(nextBookingStatuses('pending', 'customer'), ['cancelled']);
    assert.deepEqual(nextBookingStatuses('completed', 'customer'), []);
  });

  it('summarizes active bookings and provider payouts', () => {
    assert.equal(
      activeBookingCount(['pending', 'confirmed', 'completed', 'cancelled']),
      2,
    );
    assert.equal(
      providerPayoutTotal([
        {
          id: 'payment-1',
          bookingId: 'booking-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          amount: 1000,
          platformFee: 150,
          providerPayout: 850,
          status: 'paid',
          paymentMethod: 'cash_on_service',
          paidAt: null,
          createdAt: null,
        },
        {
          id: 'payment-2',
          bookingId: 'booking-2',
          customerId: 'customer-1',
          providerId: 'provider-1',
          amount: 800,
          platformFee: 120,
          providerPayout: 680,
          status: 'refunded',
          paymentMethod: 'cash_on_service',
          paidAt: null,
          createdAt: null,
        },
      ]),
      850,
    );
  });
});
