import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
    assert.equal(viewModel.data.pagination.totalItems, 0);
    assert.equal(viewModel.data.pagination.totalPages, 1);
    assert.equal(viewModel.data.pagination.hasNextPage, false);
    assert.equal(viewModel.data.pagination.hasPreviousPage, false);
  });

  it('shows five active bookings on each bookings page', () => {
    const bookings = Array.from({ length: 7 }, (_, index) =>
      booking(`active-${index + 1}`, 'confirmed'),
    );

    const firstPage = buildBookingsViewModel({
      bookingFilter: 'active',
      bookings,
      page: 1,
    });
    const secondPage = buildBookingsViewModel({
      bookingFilter: 'active',
      bookings,
      page: 2,
    });

    assert.deepEqual(
      firstPage.data.cardRows.map((row) => row.id),
      ['active-1', 'active-2', 'active-3', 'active-4', 'active-5'],
    );
    assert.deepEqual(
      secondPage.data.cardRows.map((row) => row.id),
      ['active-6', 'active-7'],
    );
    assert.equal(firstPage.data.pagination.pageLabel, 'Page 1 of 2');
    assert.equal(firstPage.data.pagination.hasNextPage, true);
    assert.equal(secondPage.data.pagination.hasPreviousPage, true);
  });

  it('shows five completed bookings per page', () => {
    const viewModel = buildBookingsViewModel({
      bookingFilter: 'completed',
      bookings: Array.from({ length: 6 }, (_, index) =>
        booking(`completed-${index + 1}`, 'completed'),
      ),
      page: 1,
    });

    assert.equal(viewModel.data.cardRows.length, 5);
    assert.equal(viewModel.data.visibleBookings.length, 6);
    assert.equal(viewModel.data.pagination.totalPages, 2);
  });

  it('resets the hook pagination page when the booking tab changes', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/features/bookings/viewModels/useBookingsViewModel.ts'),
      'utf8',
    );

    assert.match(source, /useEffect\(\(\) => \{\s*setCurrentPage\(1\);/);
    assert.match(source, /\}, \[bookingFilter\]\);/);
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
