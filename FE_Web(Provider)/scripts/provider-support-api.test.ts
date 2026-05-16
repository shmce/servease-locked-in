import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://gateway.test'

const api = await import('../src/services/serveaseProviderApi')

interface FetchCall {
  url: string
  init: RequestInit | undefined
}

const calls: FetchCall[] = []

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  calls.push({ url, init })

  if (url === 'http://gateway.test/v1/support/tickets') {
    if (init?.method === 'POST') {
      return jsonResponse(201, {
        data: {
          id: 'ticket-2',
          userId: 'provider-user-1',
          subject: 'Schedule sync issue',
          message: 'My unavailable day still appears open.',
          category: 'availability',
          status: 'open',
          createdAt: '2026-05-17T04:00:00.000Z',
          attachments: [],
        },
      })
    }

    return jsonResponse(200, {
      data: [
        {
          id: 'ticket-1',
          userId: 'provider-user-1',
          subject: 'Payout question',
          message: 'When is my next payout?',
          category: 'payments',
          status: 'in_progress',
          createdAt: '2026-05-17T03:00:00.000Z',
          attachments: [],
        },
      ],
    })
  }

  if (url === 'http://gateway.test/v1/support/tickets/ticket-1/replies') {
    if (init?.method === 'POST') {
      return jsonResponse(201, {
        data: {
          id: 'reply-2',
          ticketId: 'ticket-1',
          repliedBy: 'provider-user-1',
          message: 'Thanks for checking.',
          createdAt: '2026-05-17T05:00:00.000Z',
        },
      })
    }

    return jsonResponse(200, {
      data: [
        {
          id: 'reply-1',
          ticketId: 'ticket-1',
          repliedBy: 'admin-user-1',
          message: 'We are reviewing this payout.',
          createdAt: '2026-05-17T04:30:00.000Z',
        },
      ],
    })
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  })
}

const tickets = await api.listSupportTickets('provider-token')
assert.equal(tickets[0]?.id, 'ticket-1')

const createdTicket = await api.createSupportTicket('provider-token', {
  subject: 'Schedule sync issue',
  message: 'My unavailable day still appears open.',
  category: 'availability',
})
assert.equal(createdTicket.id, 'ticket-2')

const replies = await api.listSupportTicketReplies('provider-token', 'ticket-1')
assert.equal(replies[0]?.message, 'We are reviewing this payout.')

const createdReply = await api.createSupportTicketReply(
  'provider-token',
  'ticket-1',
  'Thanks for checking.',
)
assert.equal(createdReply.id, 'reply-2')

assert.equal(calls[0]?.init?.method, 'GET')
assert.equal(calls[1]?.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  subject: 'Schedule sync issue',
  message: 'My unavailable day still appears open.',
  category: 'availability',
})
assert.equal(calls[2]?.init?.method, 'GET')
assert.equal(calls[3]?.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(calls[3]?.init?.body)), {
  message: 'Thanks for checking.',
})

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response
}
