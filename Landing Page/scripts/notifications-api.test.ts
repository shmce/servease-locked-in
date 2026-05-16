import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const notifications = await import('../src/app/lib/notifications');
const notificationsRoute = await import('../src/app/api/notifications/route');
const notificationReadRoute = await import(
  '../src/app/api/notifications/[notificationId]/read/route'
);

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/notifications') {
    return jsonResponse(200, {
      data: [notificationPayload(false)],
    });
  }

  if (url === '/api/notifications/notification-1/read') {
    return jsonResponse(200, {
      data: notificationPayload(true),
    });
  }

  if (url === 'http://gateway.test/v1/notifications') {
    return jsonResponse(200, {
      data: [notificationPayload(false)],
    });
  }

  if (url === 'http://gateway.test/v1/notifications/notification-1/read') {
    return jsonResponse(200, {
      data: notificationPayload(true),
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const listed = await notifications.listNotifications('customer-token');
const marked = await notifications.markNotificationRead(
  'customer-token',
  'notification-1',
);

assert.equal(listed[0]?.id, 'notification-1');
assert.equal(marked.isRead, true);
assert.equal(calls[0]?.url, '/api/notifications');
assert.equal(calls[0]?.init?.method, 'GET');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.equal(calls[1]?.url, '/api/notifications/notification-1/read');
assert.equal(calls[1]?.init?.method, 'PATCH');

const listResponse = await notificationsRoute.GET(
  new Request('http://landing.test/api/notifications', {
    headers: {
      authorization: 'Bearer customer-token',
    },
  }),
);
assert.equal(listResponse.status, 200);

const markResponse = await notificationReadRoute.PATCH(
  new Request('http://landing.test/api/notifications/notification-1/read', {
    method: 'PATCH',
    headers: {
      authorization: 'Bearer customer-token',
    },
  }),
  { params: Promise.resolve({ notificationId: 'notification-1' }) },
);
assert.equal(markResponse.status, 200);

assert.equal(calls[2]?.url, 'http://gateway.test/v1/notifications');
assert.equal(calls[2]?.init?.method, 'GET');
assert.equal(
  (calls[2]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.equal(
  calls[3]?.url,
  'http://gateway.test/v1/notifications/notification-1/read',
);
assert.equal(calls[3]?.init?.method, 'PATCH');

function notificationPayload(isRead: boolean) {
  return {
    id: 'notification-1',
    userId: 'customer-1',
    type: 'booking_status_updated',
    title: 'Booking updated',
    body: 'Your booking was confirmed.',
    isRead,
    metadata: {
      bookingId: 'booking-1',
    },
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
