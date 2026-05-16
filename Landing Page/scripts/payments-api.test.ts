import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const payments = await import('../src/app/lib/payments');
const paymentsRoute = await import('../src/app/api/payments/route');
const methodsRoute = await import('../src/app/api/payments/methods/route');
const methodRoute = await import(
  '../src/app/api/payments/methods/[methodId]/route'
);

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/payments/methods') {
    if (init?.method === 'PUT') {
      return jsonResponse(200, { data: paymentMethodPayload('method-2') });
    }

    return jsonResponse(200, { data: [paymentMethodPayload('method-1')] });
  }

  if (url === '/api/payments/methods/method-1') {
    return jsonResponse(200, { data: paymentMethodPayload('method-1') });
  }

  if (url === '/api/payments') {
    return jsonResponse(201, { data: paymentPayload() });
  }

  if (url === 'http://gateway.test/v1/payments/methods') {
    if (init?.method === 'PUT') {
      return jsonResponse(200, { data: paymentMethodPayload('method-2') });
    }

    return jsonResponse(200, { data: [paymentMethodPayload('method-1')] });
  }

  if (url === 'http://gateway.test/v1/payments/methods/method-1') {
    return jsonResponse(200, { data: paymentMethodPayload('method-1') });
  }

  if (url === 'http://gateway.test/v1/payments') {
    return jsonResponse(201, { data: paymentPayload() });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const listed = await payments.listCustomerPaymentMethods('customer-token');
const saved = await payments.upsertCustomerPaymentMethod('customer-token', {
  methodType: 'gcash',
  label: 'GCash wallet',
  brand: 'GCash',
  isDefault: true,
});
const deleted = await payments.deleteCustomerPaymentMethod(
  'customer-token',
  'method-1',
);
const created = await payments.createPayment('customer-token', {
  bookingId: 'booking-1',
  paymentMethod: 'gcash',
  promoCode: 'WELCOME',
});

assert.equal(listed[0]?.id, 'method-1');
assert.equal(saved.id, 'method-2');
assert.equal(deleted.id, 'method-1');
assert.equal(created.status, 'pending');
assert.equal(calls[0]?.url, '/api/payments/methods');
assert.equal(calls[0]?.init?.method, 'GET');
assert.equal(calls[1]?.init?.method, 'PUT');
assert.equal(calls[2]?.url, '/api/payments/methods/method-1');
assert.equal(calls[2]?.init?.method, 'DELETE');
assert.equal(calls[3]?.url, '/api/payments');
assert.equal(calls[3]?.init?.method, 'POST');
assert.deepEqual(JSON.parse(String(calls[3]?.init?.body)), {
  bookingId: 'booking-1',
  paymentMethod: 'gcash',
  promoCode: 'WELCOME',
});

const listResponse = await methodsRoute.GET(
  new Request('http://landing.test/api/payments/methods', {
    headers: { authorization: 'Bearer customer-token' },
  }),
);
assert.equal(listResponse.status, 200);

const putResponse = await methodsRoute.PUT(
  new Request('http://landing.test/api/payments/methods', {
    method: 'PUT',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      methodType: 'gcash',
      label: 'GCash wallet',
      brand: 'GCash',
      isDefault: true,
    }),
  }),
);
assert.equal(putResponse.status, 200);

const deleteResponse = await methodRoute.DELETE(
  new Request('http://landing.test/api/payments/methods/method-1', {
    method: 'DELETE',
    headers: { authorization: 'Bearer customer-token' },
  }),
  { params: Promise.resolve({ methodId: 'method-1' }) },
);
assert.equal(deleteResponse.status, 200);

const createResponse = await paymentsRoute.POST(
  new Request('http://landing.test/api/payments', {
    method: 'POST',
    headers: {
      authorization: 'Bearer customer-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      bookingId: 'booking-1',
      paymentMethod: 'gcash',
      promoCode: 'WELCOME',
    }),
  }),
);
assert.equal(createResponse.status, 201);

assert.equal(calls[4]?.url, 'http://gateway.test/v1/payments/methods');
assert.equal(calls[4]?.init?.method, 'GET');
assert.equal(calls[5]?.url, 'http://gateway.test/v1/payments/methods');
assert.equal(calls[5]?.init?.method, 'PUT');
assert.equal(calls[6]?.url, 'http://gateway.test/v1/payments/methods/method-1');
assert.equal(calls[6]?.init?.method, 'DELETE');
assert.equal(calls[7]?.url, 'http://gateway.test/v1/payments');
assert.equal(calls[7]?.init?.method, 'POST');

function paymentMethodPayload(id: string) {
  return {
    id,
    customerId: 'customer-1',
    methodType: 'gcash',
    label: 'GCash wallet',
    brand: 'GCash',
    last4: '1234',
    isDefault: true,
    createdAt: '2026-05-17T00:00:00.000Z',
  };
}

function paymentPayload() {
  return {
    id: 'payment-1',
    bookingId: 'booking-1',
    customerId: 'customer-1',
    providerId: 'provider-1',
    amount: 1200,
    platformFee: 120,
    providerPayout: 1080,
    status: 'pending',
    paymentMethod: 'gcash',
    paidAt: null,
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
