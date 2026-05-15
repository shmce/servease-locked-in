import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterProviderBookings } from './providerBookings';
import { BookingSummary } from '../../services/serveaseApi';

function booking(
  id: string,
  status: BookingSummary['status'],
  overrides: Partial<BookingSummary> = {},
): BookingSummary {
  const base: BookingSummary = {
    id,
    bookingReference: `BK-${id}`,
    customerId: `customer-${id}`,
    providerId: 'provider-1',
    serviceId: 'service-1',
    serviceTitle: 'Home Service',
    status,
    scheduledAt: '2026-05-20T09:00:00.000Z',
    serviceAddress: 'Makati City',
    totalAmount: 1200,
  };

  return { ...base, ...overrides };
}

describe('filterProviderBookings', () => {
  it('groups provider bookings by operational tab', () => {
    const bookings = [
      booking('1', 'pending'),
      booking('2', 'confirmed'),
      booking('3', 'in_progress'),
      booking('4', 'completed'),
      booking('5', 'cancelled'),
      booking('6', 'rejected'),
    ];

    assert.deepEqual(filterProviderBookings(bookings, 'upcoming', '').map((item) => item.id), [
      '1',
      '2',
    ]);
    assert.deepEqual(filterProviderBookings(bookings, 'inProgress', '').map((item) => item.id), [
      '3',
    ]);
    assert.deepEqual(filterProviderBookings(bookings, 'completed', '').map((item) => item.id), [
      '4',
    ]);
    assert.deepEqual(filterProviderBookings(bookings, 'cancelled', '').map((item) => item.id), [
      '5',
      '6',
    ]);
  });

  it('searches customer and service details in the selected tab', () => {
    const bookings = [
      booking('1', 'confirmed', {
        customerFullName: 'Casey Customer',
        serviceTitle: 'Deep Cleaning',
      }),
      booking('2', 'confirmed', {
        customerFullName: 'Ari Homeowner',
        serviceTitle: 'Plumbing Repair',
      }),
    ];

    assert.deepEqual(filterProviderBookings(bookings, 'upcoming', 'casey').map((item) => item.id), [
      '1',
    ]);
    assert.deepEqual(filterProviderBookings(bookings, 'upcoming', 'plumbing').map((item) => item.id), [
      '2',
    ]);
  });
});
