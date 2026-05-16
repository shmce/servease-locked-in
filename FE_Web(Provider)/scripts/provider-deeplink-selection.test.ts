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
