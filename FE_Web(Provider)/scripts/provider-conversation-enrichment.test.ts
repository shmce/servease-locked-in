import assert from 'node:assert/strict'

const enrichment = await import('../src/app/utils/providerConversationEnrichment')

const conversations = [
  {
    id: 'conversation-1',
    bookingId: 'booking-1',
    name: 'Customer customer',
    avatar: 'CU',
    lastMessage: 'Open conversation',
    timestamp: '9:00 AM',
    unread: 0,
    bookingRef: 'Booking booking-',
    category: 'booking' as const,
    booking: {
      serviceType: 'Service Booking',
      date: 'Booking details unavailable',
      time: '',
      status: 'Open',
    },
    messages: [],
  },
  {
    id: 'conversation-2',
    bookingId: null,
    name: 'ServEase Customer',
    avatar: 'SE',
    lastMessage: 'No messages yet',
    timestamp: '',
    unread: 0,
    category: 'general' as const,
    messages: [],
  },
]

const enriched = enrichment.enrichProviderConversationsWithBookings(conversations, [
  {
    id: 'booking-1',
    bookingReference: 'BK-2026-0001',
    customerId: 'customer-1',
    customerFullName: 'Maria Santos',
    customerContactNumber: '+639171234567',
    providerId: 'provider-1',
    serviceId: 'service-1',
    serviceTitle: 'Deep Home Cleaning',
    serviceAddress: 'Makati City',
    scheduledAt: '2026-05-18T02:30:00.000Z',
    status: 'confirmed',
    totalAmount: 1800,
  },
])

assert.equal(enriched[0]?.name, 'Maria Santos')
assert.equal(enriched[0]?.avatar, 'MS')
assert.equal(enriched[0]?.bookingRef, 'BK-2026-0001')
assert.deepEqual(enriched[0]?.booking, {
  serviceType: 'Deep Home Cleaning',
  date: 'May 18, 2026',
  time: '10:30 AM',
  status: 'Confirmed',
})
assert.equal(enriched[1]?.name, 'ServEase Customer')
