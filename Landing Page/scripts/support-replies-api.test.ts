import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const supportTickets = await import('../src/app/lib/support-tickets');
const repliesRoute = await import(
  '../src/app/api/support-tickets/[ticketId]/replies/route'
);

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/support-tickets/ticket-1/replies') {
    return jsonResponse(200, {
      data: [replyPayload('reply-1', 'Admin reply')],
    });
  }

  if (url === 'http://gateway.test/v1/support/tickets/ticket-1/replies') {
    if (init?.method === 'POST') {
      return jsonResponse(201, {
        data: replyPayload('reply-2', 'Customer follow-up'),
      });
    }

    return jsonResponse(200, {
      data: [replyPayload('reply-1', 'Admin reply')],
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const listed = await supportTickets.listSupportTicketReplies(
  'customer-token',
  'ticket-1',
);
assert.equal(listed[0]?.message, 'Admin reply');
assert.equal(calls[0]?.url, '/api/support-tickets/ticket-1/replies');
assert.equal(calls[0]?.init?.method, 'GET');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);

const getResponse = await repliesRoute.GET(
  new Request('http://landing.test/api/support-tickets/ticket-1/replies', {
    headers: {
      authorization: 'Bearer customer-token',
    },
  }),
  { params: Promise.resolve({ ticketId: 'ticket-1' }) },
);
assert.equal(getResponse.status, 200);

const postResponse = await repliesRoute.POST(
  new Request('http://landing.test/api/support-tickets/ticket-1/replies', {
    method: 'POST',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ message: 'Customer follow-up' }),
  }),
  { params: Promise.resolve({ ticketId: 'ticket-1' }) },
);
assert.equal(postResponse.status, 201);

assert.equal(
  calls[1]?.url,
  'http://gateway.test/v1/support/tickets/ticket-1/replies',
);
assert.equal(calls[1]?.init?.method, 'GET');
assert.equal(
  (calls[1]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.equal(
  calls[2]?.url,
  'http://gateway.test/v1/support/tickets/ticket-1/replies',
);
assert.equal(calls[2]?.init?.method, 'POST');
assert.deepEqual(JSON.parse(String(calls[2]?.init?.body)), {
  message: 'Customer follow-up',
});

function replyPayload(id: string, message: string) {
  return {
    id,
    ticketId: 'ticket-1',
    repliedBy: 'user-1',
    message,
    createdAt: '2026-05-17T00:00:00.000Z',
  };
}

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
