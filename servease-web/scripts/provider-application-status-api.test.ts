import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const statusLib = await import('../src/app/lib/provider-application-status');
const statusRoute = await import('../src/app/api/provider-application/status/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/provider-application/status') {
    return jsonResponse(200, {
      data: {
        id: 'provider-application-1',
        applicationReference: 'PA-1234567890',
        businessName: 'GreenFix Home Services',
        serviceArea: 'Metro Manila',
        serviceDescription: 'Cleaning and repair',
        verificationStatus: 'pending',
        latestDecisionReason: 'Please upload your updated ID.',
        latestDecisionAt: '2026-05-17T08:00:00.000Z',
        createdAt: '2026-05-17T07:00:00.000Z',
        updatedAt: '2026-05-17T08:00:00.000Z',
      },
    });
  }

  if (url === 'http://gateway.test/v1/auth/provider-application/me') {
    return jsonResponse(200, {
      data: {
        id: 'provider-application-1',
        applicationReference: 'PA-1234567890',
        businessName: 'GreenFix Home Services',
        serviceArea: 'Metro Manila',
        serviceDescription: 'Cleaning and repair',
        verificationStatus: 'pending',
        latestDecisionReason: 'Please upload your updated ID.',
        latestDecisionAt: '2026-05-17T08:00:00.000Z',
        createdAt: '2026-05-17T07:00:00.000Z',
        updatedAt: '2026-05-17T08:00:00.000Z',
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const status = await statusLib.getProviderApplicationStatus('provider-token');
assert.equal(status.applicationReference, 'PA-1234567890');
assert.equal(status.verificationStatus, 'pending');

const routeResponse = await statusRoute.GET(
  new Request('http://landing.test/api/provider-application/status', {
    headers: { authorization: 'Bearer provider-token' },
  }),
);
assert.equal(routeResponse.status, 200);

assert.equal(calls[0]?.url, '/api/provider-application/status');
assert.equal(
  calls[0]?.init?.headers &&
    (calls[0].init.headers as Record<string, string>).authorization,
  'Bearer provider-token',
);
assert.equal(calls[1]?.url, 'http://gateway.test/v1/auth/provider-application/me');
assert.equal(calls[1]?.init?.method, 'GET');
assert.equal(
  calls[1]?.init?.headers &&
    (calls[1].init.headers as Record<string, string>).authorization,
  'Bearer provider-token',
);

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
