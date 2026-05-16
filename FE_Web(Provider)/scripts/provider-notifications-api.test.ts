import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://gateway.test'

const api = await import('../src/services/serveaseProviderApi')
const notificationUtils = await import('../src/app/utils/providerNotifications')

interface FetchCall {
  url: string
  init: RequestInit | undefined
}

const calls: FetchCall[] = []

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  calls.push({ url, init })

  if (url === 'http://gateway.test/v1/notifications') {
    return jsonResponse(200, {
      data: [
        {
          id: 'notification-1',
          userId: 'provider-user-1',
          type: 'payment_reserved',
          title: 'Payment reserved',
          body: 'A customer reserved payment for Home cleaning.',
          isRead: false,
          metadata: {
            bookingId: 'booking-1',
            paymentId: 'payment-1',
          },
          createdAt: '2026-05-17T05:00:00.000Z',
        },
      ],
    })
  }

  if (url === 'http://gateway.test/v1/notifications/notification-1/read') {
    return jsonResponse(200, {
      data: {
        id: 'notification-1',
        userId: 'provider-user-1',
        type: 'payment_reserved',
        title: 'Payment reserved',
        body: 'A customer reserved payment for Home cleaning.',
        isRead: true,
        metadata: {
          bookingId: 'booking-1',
          paymentId: 'payment-1',
        },
        createdAt: '2026-05-17T05:00:00.000Z',
      },
    })
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  })
}

const notifications = await api.listProviderNotifications('provider-token')
const read = await api.markProviderNotificationRead('provider-token', 'notification-1')

assert.equal(notifications[0]?.id, 'notification-1')
assert.equal(read.isRead, true)
assert.equal(calls[0]?.url, 'http://gateway.test/v1/notifications')
assert.equal(calls[0]?.init?.method, 'GET')
assert.equal((calls[0]?.init?.headers as Record<string, string>).authorization, 'Bearer provider-token')
assert.equal(calls[1]?.url, 'http://gateway.test/v1/notifications/notification-1/read')
assert.equal(calls[1]?.init?.method, 'PATCH')

assert.equal(
  notificationUtils.getProviderNotificationHref({
    type: 'payment_reserved',
    metadata: { bookingId: 'booking-1', paymentId: 'payment-1' },
  }),
  '/provider/bookings?bookingId=booking-1',
)
assert.equal(
  notificationUtils.getProviderNotificationHref({
    type: 'support_reply',
    metadata: { ticketId: 'ticket-1' },
  }),
  '/provider/help-center?ticketId=ticket-1',
)
assert.equal(
  notificationUtils.getProviderNotificationHref({
    type: 'review_created',
    metadata: { reviewId: 'review-1' },
  }),
  '/provider/reviews?reviewId=review-1',
)
assert.equal(
  notificationUtils.getProviderNotificationHref({
    type: 'conversation_message',
    metadata: { conversationId: 'conversation-1' },
  }),
  '/provider/messages?conversationId=conversation-1',
)

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}
