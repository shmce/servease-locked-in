import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const currentUser = await import('../src/app/lib/current-user');
const passwordRoute = await import('../src/app/api/me/password/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/me/password') {
    return jsonResponse(200, {
      data: {
        ok: true,
      },
    });
  }

  if (url === 'http://gateway.test/v1/me/password') {
    return jsonResponse(200, {
      data: {
        ok: true,
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

await currentUser.updateCurrentUserPassword('customer-token', {
  currentPassword: 'OldPassword#2026',
  newPassword: 'NewPassword#2026',
});

const response = await passwordRoute.PATCH(
  new Request('http://landing.test/api/me/password', {
    method: 'PATCH',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword: 'OldPassword#2026',
      newPassword: 'NewPassword#2026',
    }),
  }),
);
assert.equal(response.status, 200);

assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
  currentPassword: 'OldPassword#2026',
  newPassword: 'NewPassword#2026',
});
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.equal(calls[1]?.url, 'http://gateway.test/v1/me/password');
assert.equal(calls[1]?.init?.method, 'PATCH');
assert.equal(
  (calls[1]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  currentPassword: 'OldPassword#2026',
  newPassword: 'NewPassword#2026',
});

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
