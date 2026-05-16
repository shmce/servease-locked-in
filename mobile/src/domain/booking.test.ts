import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  activeBookingCount,
  bookingStatusChip,
  buildBookingTransitionRequest,
  buildProviderBookingSlots,
  nextBookingStatuses,
  providerPayoutTotal,
  toManilaBookingIso,
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

  it('preserves cancellation reasons in booking transition requests', () => {
    assert.deepEqual(
      buildBookingTransitionRequest(
        'confirmed',
        'cancelled',
        'Provider asked to reschedule',
      ),
      {
        currentStatus: 'confirmed',
        nextStatus: 'cancelled',
        reason: 'Provider asked to reschedule',
        explanation: 'Provider asked to reschedule',
      },
    );

    assert.deepEqual(
      buildBookingTransitionRequest('pending', 'confirmed', '  '),
      {
        currentStatus: 'pending',
        nextStatus: 'confirmed',
      },
    );
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

  it('converts form date-time values to Manila booking instants', () => {
    assert.equal(
      toManilaBookingIso('2026-05-20T10:00'),
      '2026-05-20T02:00:00.000Z',
    );
    assert.equal(toManilaBookingIso('not-a-date'), null);
  });

  it('builds bookable slots from active provider windows and days off', () => {
    const slots = buildProviderBookingSlots(
      {
        providerId: 'provider-1',
        windows: [
          {
            id: 'window-1',
            dayOfWeek: 'wednesday',
            startTime: '08:00',
            endTime: '12:00',
            isActive: true,
            sortOrder: 1,
          },
        ],
        daysOff: [
          {
            id: 'day-off-1',
            offDate: '2026-05-20',
            reason: null,
          },
        ],
      },
      2,
      ['08:00', '10:00', '11:00'],
      new Date(2026, 4, 20),
    );

    assert.deepEqual(slots.map((slot) => slot.value), [
      '2026-05-27T08:00',
      '2026-05-27T10:00',
    ]);
  });
});
