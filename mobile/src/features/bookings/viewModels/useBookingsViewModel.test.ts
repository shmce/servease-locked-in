import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BookingStatus,
  BookingSummary,
} from '../../../shared/models/types';
import { buildBookingsViewModel } from './useBookingsViewModel';

describe('buildBookingsViewModel', () => {
  it('maps active bookings to the Upcoming tab and excludes closed statuses', () => {
    const viewModel = buildBookingsViewModel({
      bookingFilter: 'active',
      bookings: [
        booking('pending-booking', 'pending'),
        booking('confirmed-booking', 'confirmed'),
        booking('in-progress-booking', 'in_progress'),
        booking('completed-booking', 'completed'),
        booking('cancelled-booking', 'cancelled'),
        booking('rejected-booking', 'rejected'),
      ],
    });

    assert.equal(viewModel.data.selectedTab, 'upcoming');
    assert.deepEqual(
      viewModel.data.visibleBookings.map((item) => item.id),
      ['pending-booking', 'confirmed-booking', 'in-progress-booking'],
    );
    assert.equal(viewModel.data.isEmpty, false);
  });

  it('maps completed bookings to the Completed tab', () => {
    const viewModel = buildBookingsViewModel({
      bookingFilter: 'completed',
      bookings: [
        booking('pending-booking', 'pending'),
        booking('completed-booking', 'completed'),
        booking('cancelled-booking', 'cancelled'),
      ],
    });

    assert.equal(viewModel.data.selectedTab, 'completed');
    assert.deepEqual(
      viewModel.data.visibleBookings.map((item) => item.id),
      ['completed-booking'],
    );
    assert.equal(viewModel.data.cardRows[0]?.statusBadge.label, 'Completed');
  });

  it('builds reference card rows with date, time, status, icon, and provider fields', () => {
    const viewModel = buildBookingsViewModel({
      bookingFilter: 'active',
      bookings: [
        booking('plumbing-booking', 'pending', {
          providerBusinessName: 'De Leon Tech Support',
          scheduledAt: '2025-05-26T02:00:00.000Z',
          serviceDescription: 'Fix leaking faucet and pipes',
          serviceTitle: 'Analytics Seed Plumbing Repair',
        }),
      ],
    });

    const row = viewModel.data.cardRows[0];

    assert.equal(row?.title, 'Analytics Seed Plumbing Repair');
    assert.equal(row?.dateLabel, 'May 26, 2025');
    assert.equal(row?.timeLabel, '10:00 AM');
    assert.deepEqual(row?.statusBadge, {
      label: 'Pending',
      tone: 'warning',
    });
    assert.equal(row?.providerLabel, 'De Leon Tech Support');
    assert.equal(row?.serviceKindLabel, 'One-time service');
    assert.equal(row?.iconKey, 'plumbing');
  });

  it('uses safe fallback labels when booking display data is missing', () => {
    const viewModel = buildBookingsViewModel({
      bookingFilter: 'active',
      bookings: [
        booking('fallback-booking', 'confirmed', {
          bookingReference: 'SE-B5124A8D7D',
          providerBusinessName: '   ',
          scheduledAt: 'not-a-date',
          serviceDescription: null,
          serviceTitle: '   ',
        }),
      ],
    });

    const row = viewModel.data.cardRows[0];

    assert.equal(row?.title, 'Service booking');
    assert.equal(row?.dateLabel, 'Schedule pending');
    assert.equal(row?.timeLabel, 'Time pending');
    assert.equal(row?.providerLabel, 'SE-B5124A8D7D');
    assert.equal(row?.statusBadge.label, 'Confirmed');
  });

  it('selects the highest-priority active booking as the helper target', () => {
    const confirmedSooner = booking('confirmed-sooner', 'confirmed', {
      scheduledAt: '2025-05-23T02:00:00.000Z',
    });
    const inProgressLater = booking('in-progress-later', 'in_progress', {
      scheduledAt: '2025-05-26T02:00:00.000Z',
    });
    const pendingEarliest = booking('pending-earliest', 'pending', {
      scheduledAt: '2025-05-20T02:00:00.000Z',
    });

    const viewModel = buildBookingsViewModel({
      bookingFilter: 'active',
      bookings: [confirmedSooner, inProgressLater, pendingEarliest],
    });

    assert.equal(viewModel.data.helperTargetBooking?.id, 'in-progress-later');
  });

  it('returns selected-tab empty copy when no booking rows are visible', () => {
    const viewModel = buildBookingsViewModel({
      bookingFilter: 'completed',
      bookings: [booking('pending-booking', 'pending')],
    });

    assert.equal(viewModel.data.isEmpty, true);
    assert.equal(viewModel.data.emptyState.title, 'No completed bookings');
  });
});

function booking(
  id: string,
  status: BookingStatus,
  overrides: Partial<BookingSummary> = {},
): BookingSummary {
  return {
    id,
    bookingReference: `SE-${id.toUpperCase()}`,
    customerId: 'customer-1',
    customerFullName: 'Casey Demo',
    customerContactNumber: null,
    providerId: 'provider-1',
    providerBusinessName: 'Sparkle Cleaners',
    serviceId: 'service-1',
    serviceTitle: 'Home Cleaning',
    serviceDescription: 'Home cleaning service',
    serviceAddress: 'Makati, Metro Manila',
    scheduledAt: '2025-05-26T02:00:00.000Z',
    hoursRequired: 2,
    serviceAmount: 550,
    pricingMode: 'flat',
    customerNotes: null,
    status,
    totalAmount: 550,
    attachments: [],
    ...overrides,
  };
}
