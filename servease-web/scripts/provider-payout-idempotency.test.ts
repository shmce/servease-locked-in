import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_API_BASE_URL = 'http://gateway.test';

const { createProviderPayoutIdempotencyKey, requestProviderPayout } =
  await import('../src/services/serveaseProviderApi');

const originalFetch = globalThis.fetch;
const calls: Array<{ url: string; idempotencyKey: string | null }> = [];

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  calls.push({
    url: String(input),
    idempotencyKey: new Headers(init?.headers).get('idempotency-key'),
  });

  return Response.json({
    data: {
      id: 'payout-1',
      providerId: 'provider-1',
      amount: 500,
      processingFee: 12.5,
      netAmount: 487.5,
      status: 'requested',
      payoutMethodId: 'method-1',
      methodType: 'gcash',
      accountLabel: 'GCash **** 1234',
      reference: 'PO-TEST',
      periodStart: null,
      periodEnd: null,
      requestedAt: '2026-05-16T00:00:00.000Z',
      paidAt: null,
      createdAt: '2026-05-16T00:00:00.000Z',
    },
  });
}) as typeof fetch;

try {
  const generatedKey = createProviderPayoutIdempotencyKey();
  assert.match(generatedKey, /^provider-payout-/);

  const payout = await requestProviderPayout(
    'provider-token',
    {
      amount: 500,
      payoutMethodId: 'method-1',
    },
    {
      idempotencyKey: 'provider-payout-retry-1',
    },
  );

  assert.equal(payout.reference, 'PO-TEST');
  assert.equal(calls[0]?.url, 'http://gateway.test/v1/payments/payouts');
  assert.equal(calls[0]?.idempotencyKey, 'provider-payout-retry-1');
} finally {
  globalThis.fetch = originalFetch;
}
