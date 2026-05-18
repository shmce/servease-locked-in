import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  activeBookingCount,
  bookingStatusChip,
  buildCalendarExportUrl,
  buildBookingTransitionRequest,
  buildMapsDirectionsUrl,
  buildProviderBookingSlots,
  formatBookingDuration,
  nextBookingStatuses,
  pricingConfidenceLabel,
  pricingFairnessLabel,
  pricingModeLabel,
  providerPayoutTotal,
  timelineEventLabel,
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

  it('humanizes raw booking timeline status labels', () => {
    assert.equal(
      timelineEventLabel({
        eventType: 'status_changed',
        label: 'Booking status changed to in_progress',
      }),
      'Service in progress',
    );
    assert.equal(
      timelineEventLabel({ eventType: 'created', label: null }),
      'Booking requested',
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

  it('builds a calendar export URL for confirmed bookings', () => {
    const url = buildCalendarExportUrl({
      bookingReference: 'SE-123',
      serviceTitle: 'Deep Clean',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T02:00:00.000Z',
      durationMinutes: 90,
    });

    assert.ok(url?.startsWith('https://calendar.google.com/calendar/render?'));
    assert.ok(url?.includes('text=ServEase%3A+Deep+Clean'));
    assert.ok(url?.includes('dates=20260520T020000Z%2F20260520T033000Z'));
    assert.ok(url?.includes('location=123+Test+St'));
    assert.equal(
      buildCalendarExportUrl({
        bookingReference: 'SE-123',
        serviceTitle: 'Deep Clean',
        scheduledAt: 'not-a-date',
      }),
      null,
    );
  });

  it('summarizes monthly earnings from payments', async () => {
    const { summarizeMonthlyEarnings } = await import('./booking');
    const summaries = summarizeMonthlyEarnings([
      {
        id: 'p-1',
        bookingId: 'b-1',
        customerId: 'c-1',
        providerId: 'pr-1',
        amount: 1000,
        platformFee: 100,
        providerPayout: 900,
        status: 'paid',
        paymentMethod: null,
        paidAt: '2026-05-10T00:00:00.000Z',
        createdAt: null,
      },
      {
        id: 'p-2',
        bookingId: 'b-2',
        customerId: 'c-1',
        providerId: 'pr-1',
        amount: 800,
        platformFee: 80,
        providerPayout: 720,
        status: 'pending',
        paymentMethod: null,
        paidAt: null,
        createdAt: '2026-05-12T00:00:00.000Z',
      },
      {
        id: 'p-3',
        bookingId: 'b-3',
        customerId: 'c-1',
        providerId: 'pr-1',
        amount: 500,
        platformFee: 50,
        providerPayout: 450,
        status: 'paid',
        paymentMethod: null,
        paidAt: '2026-04-20T00:00:00.000Z',
        createdAt: null,
      },
      {
        id: 'p-4',
        bookingId: 'b-4',
        customerId: 'c-1',
        providerId: 'pr-1',
        amount: 200,
        platformFee: 20,
        providerPayout: 180,
        status: 'refunded',
        paymentMethod: null,
        paidAt: '2026-04-01T00:00:00.000Z',
        createdAt: null,
      },
    ]);

    assert.equal(summaries.length, 2);
    assert.equal(summaries[0].monthKey, '2026-05');
    assert.equal(summaries[0].totalPayout, 1620);
    assert.equal(summaries[0].paidCount, 1);
    assert.equal(summaries[0].pendingCount, 1);
    assert.equal(summaries[1].monthKey, '2026-04');
    assert.equal(summaries[1].totalPayout, 450);
    assert.equal(summaries[1].paidCount, 1);
    assert.equal(summaries[1].pendingCount, 0);
  });

  it('formats booking duration in human-readable form', () => {
    assert.equal(formatBookingDuration(null), 'Not specified');
    assert.equal(formatBookingDuration(0), 'Not specified');
    assert.equal(formatBookingDuration(1), '1 hour');
    assert.equal(formatBookingDuration(2), '2 hours');
    assert.equal(formatBookingDuration(1.5), '1 hr 30 min');
    assert.equal(formatBookingDuration(0.5), '30 min');
  });

  it('labels pricing modes for display', () => {
    assert.equal(pricingModeLabel('flat'), 'Flat rate');
    assert.equal(pricingModeLabel('hourly'), 'Hourly rate');
    assert.equal(pricingModeLabel(null), 'Standard rate');
    assert.equal(pricingModeLabel(undefined), 'Standard rate');
  });

  it('labels pricing engine fairness and confidence for display', () => {
    assert.equal(pricingFairnessLabel('within_range'), 'Within fair range');
    assert.equal(pricingFairnessLabel('above_range'), 'Above fair range');
    assert.equal(pricingFairnessLabel('below_range'), 'Below fair range');
    assert.equal(pricingConfidenceLabel('high'), 'High confidence');
    assert.equal(pricingConfidenceLabel('low'), 'Low confidence');
  });

  it('builds a maps directions URL from a booking destination', () => {
    assert.equal(
      buildMapsDirectionsUrl('  123 Test St, Manila  '),
      'https://www.google.com/maps/dir/?api=1&destination=123+Test+St%2C+Manila&travelmode=driving',
    );
    assert.equal(buildMapsDirectionsUrl('  '), null);
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
