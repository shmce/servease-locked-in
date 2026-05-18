import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ServEaseApiError,
  createServEaseClient,
  type FetchLike,
} from '../src/index.ts';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('createServEaseClient', () => {
  it('builds gateway URLs with query params and auth headers', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({ data: [{ id: 'provider-1', businessName: 'QuickFix' }] });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test/',
      accessToken: 'tribe-token',
      fetch: fetcher,
    });

    const providers = await client.catalog.listProviders({
      serviceId: 'service-1',
      city: 'Manila',
    });

    assert.equal(providers[0]?.id, 'provider-1');
    assert.equal(
      requests[0]?.url,
      'https://api.servease.test/v1/catalog/providers?serviceId=service-1&city=Manila',
    );
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer tribe-token');
  });

  it('attaches idempotency keys for side-effect requests', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({
        data: {
          bookingId: 'booking-1',
          status: 'pending',
          serviceId: 'service-1',
          providerId: 'provider-1',
          scheduledAt: '2026-05-20T09:00:00.000Z',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      fetch: fetcher,
    });

    await client.bookings.create(
      {
        serviceId: 'service-1',
        providerId: 'provider-1',
        scheduledAt: '2026-05-20T09:00:00.000Z',
        serviceAddress: {
          line1: '123 Street',
          city: 'Manila',
          latitude: 14.5995,
          longitude: 120.9842,
        },
        hoursRequired: 2,
      },
      { accessToken: 'customer-token', idempotencyKey: 'booking-key-1' },
    );

    assert.equal(requests[0]?.method, 'POST');
    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/bookings');
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer customer-token');
    assert.equal(requests[0]?.headers.get('idempotency-key'), 'booking-key-1');
    assert.equal(requests[0]?.headers.get('content-type'), 'application/json');
  });

  it('throws ServEaseApiError for gateway error envelopes', async () => {
    const fetcher: FetchLike = async () =>
      jsonResponse(
        {
          error: {
            code: 'provider_unavailable',
            message: 'Provider is unavailable.',
            details: { providerId: 'provider-1' },
          },
        },
        { status: 409 },
      );

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      fetch: fetcher,
    });

    await assert.rejects(
      () => client.bookings.get('booking-1'),
      (error) => {
        assert.ok(error instanceof ServEaseApiError);
        assert.equal(error.status, 409);
        assert.equal(error.code, 'provider_unavailable');
        assert.equal(error.message, 'Provider is unavailable.');
        assert.deepEqual(error.details, { providerId: 'provider-1' });
        return true;
      },
    );
  });
});
