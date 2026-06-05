import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BookingStatus,
  BookingSummary,
} from '../../../shared/models/types';
import { buildCustomerCalendarAgenda } from './useCustomerCalendarViewModel';

describe('buildCustomerCalendarAgenda', () => {
  it('keeps the upcoming preview to three active bookings', () => {
    const agenda = buildCustomerCalendarAgenda({
      bookings: Array.from({ length: 5 }, (_, index) =>
        booking(`booking-${index + 1}`, 'confirmed', `2026-06-${10 + index}T02:00:00.000Z`),
      ),
      selectedDate: null,
    });

    assert.deepEqual(
      agenda.selectedDateBookings.map((item) => item.booking.id),
      ['booking-1', 'booking-2', 'booking-3'],
    );
    assert.equal(agenda.pagination.hasNextPage, false);
    assert.equal(agenda.pagination.totalItems, 3);
  });

  it('paginates selected-date bookings three at a time', () => {
    const bookings = Array.from({ length: 5 }, (_, index) =>
      booking(`same-day-${index + 1}`, 'confirmed', `2026-06-10T0${index}:00:00.000Z`),
    );

    const firstPage = buildCustomerCalendarAgenda({
      bookings,
      selectedDate: '2026-06-10',
      page: 1,
    });
    const secondPage = buildCustomerCalendarAgenda({
      bookings,
      selectedDate: '2026-06-10',
      page: 2,
    });

    assert.deepEqual(
      firstPage.selectedDateBookings.map((item) => item.booking.id),
      ['same-day-1', 'same-day-2', 'same-day-3'],
    );
    assert.deepEqual(
      secondPage.selectedDateBookings.map((item) => item.booking.id),
      ['same-day-4', 'same-day-5'],
    );
    assert.equal(firstPage.pagination.pageLabel, 'Page 1 of 2');
    assert.equal(firstPage.pagination.hasNextPage, true);
    assert.equal(secondPage.pagination.hasPreviousPage, true);
  });

  it('resets selected-date pagination when the selected date changes', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/customer-calendar/viewModels/useCustomerCalendarViewModel.ts',
      ),
      'utf8',
    );

    assert.match(source, /const selectDate = useCallback\(\(date: string \| null\) => \{/);
    assert.match(source, /setSelectedDatePage\(1\);/);
  });
});

function booking(
  id: string,
  status: BookingStatus,
  scheduledAt: string,
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
    scheduledAt,
    hoursRequired: 2,
    serviceAmount: 550,
    pricingMode: 'flat',
    customerNotes: null,
    status,
    totalAmount: 550,
    attachments: [],
  };
}
