import assert from 'node:assert/strict';

const supportTickets = await import('../src/app/lib/support-tickets');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/support-tickets') {
    return jsonResponse(201, {
      data: {
        id: 'ticket-1',
        userId: 'customer-1',
        subject: 'Booking issue: SRV-2026-0001',
        message: 'Booking: booking-1\nReference: SRV-2026-0001\n\nProvider did not arrive.',
        category: 'booking_issue',
        status: 'open',
        createdAt: '2026-05-17T00:00:00.000Z',
        attachments: [],
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const ticket = await supportTickets.createBookingIssueSupportTicket(
  'customer-token',
  {
    bookingId: 'booking-1',
    bookingReference: 'SRV-2026-0001',
    message: 'Provider did not arrive.',
  },
);

assert.equal(ticket.id, 'ticket-1');
assert.equal(calls[0]?.url, '/api/support-tickets');
assert.equal(calls[0]?.init?.method, 'POST');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
  subject: 'Booking issue: SRV-2026-0001',
  message: 'Booking: booking-1\nReference: SRV-2026-0001\n\nProvider did not arrive.',
  category: 'booking_issue',
});

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
