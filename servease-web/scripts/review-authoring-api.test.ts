import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const reviews = await import('../src/app/lib/reviews');
const reviewsRoute = await import('../src/app/api/reviews/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/reviews') {
    return jsonResponse(201, {
      data: {
        id: 'review-1',
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewerId: 'customer-1',
        rating: 5,
        reviewText: 'Excellent service.',
        isFlagged: false,
        createdAt: '2026-05-17T00:00:00.000Z',
      },
    });
  }

  if (url === 'http://gateway.test/v1/reviews') {
    return jsonResponse(201, {
      data: {
        id: 'review-1',
        bookingId: 'booking-1',
        providerId: 'provider-1',
        reviewerId: 'customer-1',
        rating: 5,
        reviewText: 'Excellent service.',
        isFlagged: false,
        createdAt: '2026-05-17T00:00:00.000Z',
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const created = await reviews.createReview('customer-token', {
  bookingId: 'booking-1',
  rating: 5,
  reviewText: 'Excellent service.',
});

assert.equal(created.id, 'review-1');
assert.equal(calls[0]?.url, '/api/reviews');
assert.equal(calls[0]?.init?.method, 'POST');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
  bookingId: 'booking-1',
  rating: 5,
  reviewText: 'Excellent service.',
});

const response = await reviewsRoute.POST(
  new Request('http://landing.test/api/reviews', {
    method: 'POST',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      bookingId: 'booking-1',
      rating: 5,
      reviewText: 'Excellent service.',
    }),
  }),
);
assert.equal(response.status, 201);

assert.equal(calls[1]?.url, 'http://gateway.test/v1/reviews');
assert.equal(calls[1]?.init?.method, 'POST');
assert.equal(
  (calls[1]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  bookingId: 'booking-1',
  rating: 5,
  reviewText: 'Excellent service.',
});

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
