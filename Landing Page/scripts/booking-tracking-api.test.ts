import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const bookings = await import('../src/app/lib/bookings');
const trackingRoute = await import(
  '../src/app/api/bookings/[bookingId]/tracking/route'
);

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/bookings/booking-1/tracking') {
    return jsonResponse(200, {
      data: trackingPayload(),
    });
  }

  if (url === 'http://gateway.test/v1/bookings/booking-1/tracking') {
    return jsonResponse(200, {
      data: trackingPayload(),
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const snapshot = await bookings.getBookingTrackingSnapshot(
  'booking-1',
  'customer-token',
);
assert.equal(snapshot.phase, 'on_the_way');
assert.equal(snapshot.etaMinutes, 18);
assert.equal(calls[0]?.url, '/api/bookings/booking-1/tracking');
assert.equal(calls[0]?.init?.method, 'GET');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);

const response = await trackingRoute.GET(
  new Request('http://landing.test/api/bookings/booking-1/tracking', {
    headers: {
      authorization: 'Bearer customer-token',
    },
  }),
  { params: Promise.resolve({ bookingId: 'booking-1' }) },
);
assert.equal(response.status, 200);

assert.equal(calls[1]?.url, 'http://gateway.test/v1/bookings/booking-1/tracking');
assert.equal(calls[1]?.init?.method, 'GET');
assert.equal(
  (calls[1]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);

function trackingPayload() {
  return {
    bookingId: 'booking-1',
    bookingReference: 'SRV-2026-0001',
    status: 'in_progress',
    phase: 'on_the_way',
    etaMinutes: 18,
    distanceKm: 4.2,
    trafficLevel: 'moderate',
    destinationAddress: '123 Main Street',
    destinationLocation: {
      latitude: 14.5995,
      longitude: 120.9842,
    },
    providerLocation: {
      latitude: 14.6091,
      longitude: 121.0223,
    },
    scheduledAt: '2026-05-18T09:00:00.000Z',
    lastUpdatedAt: '2026-05-18T08:42:00.000Z',
  };
}

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
