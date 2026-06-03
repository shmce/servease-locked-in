import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConversationSummary } from '../../../shared/models/types';
import { resolveSelectedConversationAfterReplace } from './messagesSelection';

describe('resolveSelectedConversationAfterReplace', () => {
  it('does not auto-select the first conversation when opening messages', () => {
    assert.equal(
      resolveSelectedConversationAfterReplace(null, [
        conversation('conversation-latest'),
        conversation('conversation-older'),
      ]),
      null,
    );
  });

  it('preserves an existing selected conversation when it is still visible', () => {
    assert.equal(
      resolveSelectedConversationAfterReplace('conversation-older', [
        conversation('conversation-latest'),
        conversation('conversation-older'),
      ]),
      'conversation-older',
    );
  });

  it('clears stale selected conversations after refresh', () => {
    assert.equal(
      resolveSelectedConversationAfterReplace('conversation-missing', [
        conversation('conversation-latest'),
      ]),
      null,
    );
  });
});

function conversation(id: string): ConversationSummary {
  return {
    id,
    bookingId: `booking-${id}`,
    customerId: 'customer-1',
    providerId: 'provider-1',
    lastMessageAt: '2026-06-02T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
  };
}
