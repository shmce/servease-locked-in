import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const currentUser = await import('../src/app/lib/current-user');
const enableRoute = await import('../src/app/api/me/two-factor/enable/route');
const verifyRoute = await import('../src/app/api/me/two-factor/verify/route');
const disableRoute = await import('../src/app/api/me/two-factor/disable/route');
const meRoute = await import('../src/app/api/me/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/me/two-factor/enable') {
    return jsonResponse(200, { data: provisioningPayload() });
  }

  if (url === '/api/me/two-factor/verify') {
    return jsonResponse(200, { data: enabledStatusPayload() });
  }

  if (url === '/api/me/two-factor/disable') {
    return jsonResponse(200, { data: disabledStatusPayload() });
  }

  if (url === '/api/me') {
    return jsonResponse(200, { data: { ok: true } });
  }

  if (url === 'http://gateway.test/v1/me/two-factor/enable') {
    return jsonResponse(200, { data: provisioningPayload() });
  }

  if (url === 'http://gateway.test/v1/me/two-factor/verify') {
    return jsonResponse(200, { data: enabledStatusPayload() });
  }

  if (url === 'http://gateway.test/v1/me/two-factor/disable') {
    return jsonResponse(200, { data: disabledStatusPayload() });
  }

  if (url === 'http://gateway.test/v1/me') {
    return jsonResponse(200, { data: { ok: true } });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const provisioning = await currentUser.enableCurrentUserTwoFactor('customer-token');
const verified = await currentUser.verifyCurrentUserTwoFactor(
  'customer-token',
  '123456',
);
const disabled = await currentUser.disableCurrentUserTwoFactor(
  'customer-token',
  '654321',
);
const deleted = await currentUser.deleteCurrentUserAccount('customer-token');

assert.equal(provisioning.secret, 'JBSWY3DPEHPK3PXP');
assert.equal(verified.enabled, true);
assert.equal(disabled.enabled, false);
assert.equal(deleted.ok, true);

const enableResponse = await enableRoute.POST(
  new Request('http://landing.test/api/me/two-factor/enable', {
    method: 'POST',
    headers: { authorization: 'Bearer customer-token' },
  }),
);
assert.equal(enableResponse.status, 200);

const verifyResponse = await verifyRoute.POST(
  new Request('http://landing.test/api/me/two-factor/verify', {
    method: 'POST',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ code: '123456' }),
  }),
);
assert.equal(verifyResponse.status, 200);

const disableResponse = await disableRoute.POST(
  new Request('http://landing.test/api/me/two-factor/disable', {
    method: 'POST',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ code: '654321' }),
  }),
);
assert.equal(disableResponse.status, 200);

const deleteResponse = await meRoute.DELETE(
  new Request('http://landing.test/api/me', {
    method: 'DELETE',
    headers: { authorization: 'Bearer customer-token' },
  }),
);
assert.equal(deleteResponse.status, 200);

assert.equal(calls[0]?.url, '/api/me/two-factor/enable');
assert.equal(calls[1]?.url, '/api/me/two-factor/verify');
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), { code: '123456' });
assert.equal(calls[2]?.url, '/api/me/two-factor/disable');
assert.deepEqual(JSON.parse(String(calls[2]?.init?.body)), { code: '654321' });
assert.equal(calls[3]?.url, '/api/me');
assert.equal(calls[3]?.init?.method, 'DELETE');
assert.equal(calls[4]?.url, 'http://gateway.test/v1/me/two-factor/enable');
assert.equal(calls[4]?.init?.method, 'POST');
assert.equal(calls[5]?.url, 'http://gateway.test/v1/me/two-factor/verify');
assert.deepEqual(JSON.parse(String(calls[5]?.init?.body)), { code: '123456' });
assert.equal(calls[6]?.url, 'http://gateway.test/v1/me/two-factor/disable');
assert.deepEqual(JSON.parse(String(calls[6]?.init?.body)), { code: '654321' });
assert.equal(calls[7]?.url, 'http://gateway.test/v1/me');
assert.equal(calls[7]?.init?.method, 'DELETE');

function provisioningPayload() {
  return {
    enabled: false,
    secret: 'JBSWY3DPEHPK3PXP',
    otpauthUrl: 'otpauth://totp/ServEase:customer@example.test',
    qrCodeDataUrl: 'data:image/png;base64,AA==',
  };
}

function enabledStatusPayload() {
  return {
    enabled: true,
    verifiedAt: '2026-05-20T10:00:00.000Z',
  };
}

function disabledStatusPayload() {
  return {
    enabled: false,
    verifiedAt: null,
  };
}

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
