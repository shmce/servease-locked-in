import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const referrals = await import('../src/app/lib/referrals');
const referralsRoute = await import('../src/app/api/referrals/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/referrals') {
    return jsonResponse(200, {
      data: referralPayload(),
    });
  }

  if (url === 'http://gateway.test/v1/referrals') {
    return jsonResponse(200, {
      data: referralPayload(),
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const summary = await referrals.getReferralSummary('customer-token');
assert.equal(summary.referralCode, 'SE-ABC12345');
assert.equal(calls[0]?.url, '/api/referrals');
assert.equal(calls[0]?.init?.method, 'GET');
assert.equal(
  (calls[0]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);

const response = await referralsRoute.GET(
  new Request('http://landing.test/api/referrals', {
    headers: {
      authorization: 'Bearer customer-token',
    },
  }),
);
assert.equal(response.status, 200);

assert.equal(calls[1]?.url, 'http://gateway.test/v1/referrals');
assert.equal(calls[1]?.init?.method, 'GET');
assert.equal(
  (calls[1]?.init?.headers as Record<string, string>).authorization,
  'Bearer customer-token',
);

function referralPayload() {
  return {
    referralCode: 'SE-ABC12345',
    referralLinkPath: '/register?ref=SE-ABC12345',
    completedReferrals: 2,
    pendingReferrals: 1,
    totalRewards: 250,
  };
}

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
