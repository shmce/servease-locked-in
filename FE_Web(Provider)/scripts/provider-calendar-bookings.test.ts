import assert from 'node:assert/strict'

import {
  groupBookingsForProviderCalendar,
  getCalendarDateKey,
} from '../src/app/utils/providerCalendarBookings'
import type { BookingSummary } from '../src/services/serveaseProviderApi'

const bookings: BookingSummary[] = [
  {
    id: 'booking-2',
    bookingReference: 'BK-002',
    customerId: 'customer-2',
    customerFullName: null,
    customerContactNumber: null,
    providerId: 'provider-1',
    serviceId: 'service-2',
    serviceTitle: null,
    serviceAddress: 'Makati',
    scheduledAt: '2026-05-18T05:00:00.000Z',
    status: 'confirmed',
    totalAmount: 1200,
  },
  {
    id: 'booking-1',
    bookingReference: 'BK-001',
    customerId: 'customer-1',
    customerFullName: 'Ana Reyes',
    customerContactNumber: null,
    providerId: 'provider-1',
    serviceId: 'service-1',
    serviceTitle: 'Deep Cleaning',
    serviceAddress: 'BGC',
    scheduledAt: '2026-05-18T01:00:00.000Z',
    status: 'pending',
    totalAmount: 1500,
  },
  {
    id: 'booking-3',
    bookingReference: 'BK-003',
    customerId: 'customer-3',
    customerFullName: 'Luis Santos',
    customerContactNumber: null,
    providerId: 'provider-1',
    serviceId: 'service-3',
    serviceTitle: 'Electrical Repair',
    serviceAddress: 'Pasig',
    scheduledAt: '2026-05-19T02:30:00.000Z',
    status: 'cancelled',
    totalAmount: 500,
  },
]

const grouped = groupBookingsForProviderCalendar(bookings)

assert.deepEqual(
  Object.keys(grouped),
  ['2026-05-18', '2026-05-19'],
  'bookings should be grouped by scheduled calendar date',
)
assert.deepEqual(
  grouped['2026-05-18'].map((booking) => booking.id),
  ['booking-1', 'booking-2'],
  'bookings on the same day should be sorted by scheduled time',
)
assert.equal(grouped['2026-05-18'][0].time, '9:00 AM')
assert.equal(grouped['2026-05-18'][0].service, 'Deep Cleaning')
assert.equal(grouped['2026-05-18'][0].customer, 'Ana Reyes')
assert.equal(grouped['2026-05-18'][0].amount, 1500)
assert.equal(grouped['2026-05-18'][1].service, 'Service booking')
assert.equal(grouped['2026-05-18'][1].customer, 'Customer customer')
assert.equal(grouped['2026-05-19'][0].status, 'cancelled')
assert.equal(
  getCalendarDateKey(new Date('2026-05-18T16:00:00.000Z')),
  '2026-05-19',
  'date keys should use the provider Manila calendar day',
)
