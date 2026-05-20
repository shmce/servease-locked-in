import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://gateway.test';

const providerApi = await import('../src/services/serveaseProviderApi');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === 'http://gateway.test/v1/geo/directions') {
    return jsonResponse(200, {
      data: {
        provider: 'openrouteservice',
        distanceMeters: 2480,
        durationSeconds: 640,
        geometry: [
          { latitude: 14.5995, longitude: 120.9842 },
          { latitude: 14.61, longitude: 121.001 },
        ],
        steps: [
          {
            instruction: 'Head east',
            distanceMeters: 240,
            durationSeconds: 60,
          },
        ],
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const route = await providerApi.getProviderDirections(
  'provider-token',
  { latitude: 14.5995, longitude: 120.9842 },
  { latitude: 14.61, longitude: 121.001 },
);

assert.equal(route.provider, 'openrouteservice');
assert.equal(route.distanceMeters, 2480);
assert.equal(calls[0]?.url, 'http://gateway.test/v1/geo/directions');
assert.equal(calls[0]?.init?.method, 'POST');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer provider-token',
);
assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
  origin: { latitude: 14.5995, longitude: 120.9842 },
  destination: { latitude: 14.61, longitude: 121.001 },
  profile: 'driving-car',
  language: 'en',
});

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
