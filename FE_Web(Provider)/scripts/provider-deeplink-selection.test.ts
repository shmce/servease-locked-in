import assert from 'node:assert/strict'

const deeplinks = await import('../src/app/utils/providerDeeplinks')

assert.equal(
  deeplinks.pickQueryItemId('?ticketId=ticket-2', 'ticketId', ['ticket-1', 'ticket-2'], 'ticket-1'),
  'ticket-2',
)
assert.equal(
  deeplinks.pickQueryItemId('?ticketId=missing', 'ticketId', ['ticket-1'], 'ticket-1'),
  'ticket-1',
)
assert.equal(
  deeplinks.pickQueryItemId('', 'ticketId', ['ticket-1'], 'ticket-1'),
  'ticket-1',
)
assert.equal(
  deeplinks.pickQueryItemId('?conversationId=conversation-1', 'conversationId', [
    'conversation-1',
  ]),
  'conversation-1',
)
assert.equal(
  deeplinks.pickQueryItemId('?conversationId=conversation-2', 'conversationId', [
    'conversation-1',
  ]),
  null,
)

const bookings = [
  { id: 'booking-1', status: 'upcoming' },
  { id: 'booking-2', status: 'completed' },
]

assert.deepEqual(
  deeplinks.pickQueryItem('?bookingId=booking-2', 'bookingId', bookings),
  bookings[1],
)
assert.equal(
  deeplinks.pickQueryItemStatus(
    '?bookingId=booking-2',
    'bookingId',
    bookings,
    'upcoming',
  ),
  'completed',
)
assert.equal(
  deeplinks.pickQueryItemStatus(
    '?bookingId=missing',
    'bookingId',
    bookings,
    'upcoming',
  ),
  'upcoming',
)
assert.deepEqual(
  deeplinks.pickQueryItem('?paymentId=payment-2', 'paymentId', [
    { id: 'payment-1' },
    { id: 'payment-2' },
  ]),
  { id: 'payment-2' },
)
