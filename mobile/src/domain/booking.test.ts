import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  activeBookingCount,
  bookingStatusChip,
  buildCustomerBookingAvailability,
  buildCalendarExportUrl,
  buildBookingTransitionRequest,
  buildCustomerBookingCalendarState,
  buildMapsDirectionsUrl,
  buildProviderBookingSlots,
  providerUnavailableSlotPickerMessage,
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
        timeOffWindows: [],
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

  it('builds customer availability with whole-day off and partial time-off states', () => {
    const schedule = {
      providerId: 'provider-1',
      windows: [
        {
          id: 'window-1',
          dayOfWeek: 'tuesday' as const,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
          sortOrder: 1,
        },
      ],
      daysOff: [{ id: 'day-off-1', offDate: '2026-05-27', reason: null }],
      timeOffWindows: [
        {
          id: 'time-off-1',
          offDate: '2026-05-26',
          startTime: '14:00',
          endTime: '17:00',
          reason: null,
        },
      ],
    };

    const availability = buildCustomerBookingAvailability(
      schedule,
      1,
      ['13:00', '14:00', '15:00', '16:00', '17:00'],
      new Date('2026-05-26T00:00:00'),
      '2026-05-26',
    );

    assert.equal(
      availability.dateOptions.find((date) => date.value === '2026-05-26')?.isAvailable,
      true,
    );
    assert.equal(
      availability.dateOptions.find((date) => date.value === '2026-05-27')?.isAvailable,
      false,
    );
    assert.equal(
      availability.dateOptions.find((date) => date.value === '2026-05-27')?.unavailableLabel,
      'Provider unavailable',
    );
    assert.deepEqual(
      availability.timeOptions.map((slot) => ({
        time: slot.time,
        isAvailable: slot.isAvailable,
        unavailableLabel: slot.unavailableLabel,
      })),
      [
        { time: '13:00', isAvailable: true, unavailableLabel: undefined },
        { time: '14:00', isAvailable: false, unavailableLabel: 'Provider unavailable' },
        { time: '15:00', isAvailable: false, unavailableLabel: 'Provider unavailable' },
        { time: '16:00', isAvailable: false, unavailableLabel: 'Provider unavailable' },
        { time: '17:00', isAvailable: true, unavailableLabel: undefined },
      ],
    );
  });

  it('keeps weekly window edge slots available only when the full duration fits', () => {
    const schedule = {
      providerId: 'provider-1',
      windows: [
        {
          id: 'window-1',
          dayOfWeek: 'tuesday' as const,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          sortOrder: 1,
        },
      ],
      daysOff: [],
      timeOffWindows: [],
    };

    const availability = buildCustomerBookingAvailability(
      schedule,
      2,
      ['08:00', '09:00', '15:00', '16:00'],
      new Date('2026-05-26T00:00:00'),
      '2026-05-26',
    );

    assert.deepEqual(
      availability.timeOptions.map((slot) => ({
        time: slot.time,
        isAvailable: slot.isAvailable,
        unavailableLabel: slot.unavailableLabel,
      })),
      [
        { time: '08:00', isAvailable: false, unavailableLabel: 'Provider unavailable' },
        { time: '09:00', isAvailable: true, unavailableLabel: undefined },
        { time: '15:00', isAvailable: true, unavailableLabel: undefined },
        { time: '16:00', isAvailable: false, unavailableLabel: 'Provider unavailable' },
      ],
    );
  });

  it('maps provider unavailable booking errors to the slot picker message', () => {
    assert.equal(
      providerUnavailableSlotPickerMessage(
        { code: 'provider_unavailable' },
        'Provider is unavailable for the requested time.',
      ),
      'This slot was just taken or blocked. Please pick another.',
    );
    assert.equal(
      providerUnavailableSlotPickerMessage(
        new Error('Provider is unavailable for the requested time.'),
        'Provider is unavailable for the requested time.',
      ),
      'This slot was just taken or blocked. Please pick another.',
    );
    assert.equal(
      providerUnavailableSlotPickerMessage(
        new Error('Payment method required.'),
        'Payment method required.',
      ),
      null,
    );
  });

  it('builds customer calendar disabled dates and partial markers', () => {
    const schedule = {
      providerId: 'provider-1',
      windows: [
        {
          id: 'window-1',
          dayOfWeek: 'tuesday' as const,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          sortOrder: 1,
        },
        {
          id: 'window-2',
          dayOfWeek: 'wednesday' as const,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          sortOrder: 2,
        },
      ],
      daysOff: [{ id: 'day-off-1', offDate: '2026-05-28', reason: null }],
      timeOffWindows: [
        {
          id: 'partial-1',
          offDate: '2026-05-26',
          startTime: '14:00',
          endTime: '17:00',
          reason: null,
        },
        {
          id: 'full-1',
          offDate: '2026-05-27',
          startTime: '09:00',
          endTime: '17:00',
          reason: null,
        },
      ],
    };

    const state = buildCustomerBookingCalendarState(
      schedule,
      1,
      ['09:00', '13:00', '14:00', '15:00', '16:00'],
      '2026-05',
    );

    assert.equal(state.disabledDates.has('2026-05-26'), false);
    assert.equal(state.markers['2026-05-26'], 'partial');
    assert.equal(state.disabledDates.has('2026-05-27'), true);
    assert.equal(state.markers['2026-05-27'], undefined);
    assert.equal(state.disabledDates.has('2026-05-28'), true);
    assert.equal(state.disabledDates.has('2026-05-29'), true);
  });

  it('excludes bookable slots that overlap provider time-off windows', () => {
    const slots = buildProviderBookingSlots(
      {
        providerId: 'provider-1',
        windows: [
          {
            id: 'window-1',
            dayOfWeek: 'wednesday',
            startTime: '08:00',
            endTime: '17:00',
            isActive: true,
            sortOrder: 1,
          },
        ],
        daysOff: [],
        timeOffWindows: [
          {
            id: 'time-off-1',
            offDate: '2026-05-20',
            startTime: '14:00',
            endTime: '17:00',
            reason: null,
          },
        ],
      },
      1,
      ['13:00', '14:00', '16:00'],
      new Date(2026, 4, 20),
    );

    const values = slots.map((slot) => slot.value);

    assert.ok(values.includes('2026-05-20T13:00'));
    assert.ok(!values.includes('2026-05-20T14:00'));
    assert.ok(!values.includes('2026-05-20T16:00'));
  });
});
