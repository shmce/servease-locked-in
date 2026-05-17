import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveNotificationRoute } from './notificationRouting';

describe('resolveNotificationRoute', () => {
  it('routes support metadata to the active role help center', () => {
    assert.deepEqual(
      resolveNotificationRoute({
        role: 'provider',
        type: 'support_reply',
        metadata: { ticketId: 'ticket-1' },
      }),
      {
        role: 'provider',
        screen: 'providerHelp',
        ticketId: 'ticket-1',
      },
    );
  });

  it('routes conversation push payloads to messages', () => {
    assert.deepEqual(
      resolveNotificationRoute({
        role: 'customer',
        data: { type: 'conversation_message', conversationId: 'conversation-1' },
      }),
      {
        role: 'customer',
        screen: 'messages',
        conversationId: 'conversation-1',
      },
    );
  });

  it('routes booking notifications to role-specific booking detail screens', () => {
    assert.deepEqual(
      resolveNotificationRoute({
        role: 'provider',
        type: 'admin_booking_escalated',
        metadata: { bookingId: 'booking-1' },
      }),
      {
        role: 'provider',
        screen: 'providerBookingDetail',
        bookingId: 'booking-1',
      },
    );
  });

  it('falls back to notification center when metadata has no destination', () => {
    assert.deepEqual(
      resolveNotificationRoute({
        role: 'customer',
        type: 'admin_broadcast',
        metadata: null,
      }),
      {
        role: 'customer',
        screen: 'customerNotifications',
      },
    );
  });
});
