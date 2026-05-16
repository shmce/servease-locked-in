import assert from 'node:assert/strict';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const customerAuth = await import('../src/app/lib/customer-auth');
const registrationRoute = await import('../src/app/api/customer-registration/route');
const passwordResetRoute = await import('../src/app/api/password-reset/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/customer-registration') {
    return jsonResponse(201, {
      data: {
        user: {
          id: 'customer-user-1',
          email: 'customer@servease.test',
          fullName: 'Customer User',
          contactNumber: '+639171234567',
          role: 'customer',
          status: 'active',
        },
        customerProfile: {
          id: 'customer-profile-1',
          address: 'Makati City',
        },
        providerProfile: null,
      },
    });
  }

  if (url === '/api/password-reset') {
    return jsonResponse(200, {
      data: {
        ok: true,
      },
    });
  }

  if (url === 'http://gateway.test/v1/auth/register') {
    return jsonResponse(201, {
      data: {
        user: {
          id: 'customer-user-1',
          email: 'customer@servease.test',
          fullName: 'Customer User',
          contactNumber: '+639171234567',
          role: 'customer',
          status: 'active',
        },
        customerProfile: {
          id: 'customer-profile-1',
          address: 'Makati City',
        },
        providerProfile: null,
      },
    });
  }

  if (url === 'http://gateway.test/v1/auth/password-reset') {
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

await customerAuth.registerCustomer({
  fullName: ' Customer User ',
  email: ' Customer@ServEase.test ',
  password: 'password123',
  contactNumber: '0917 123 4567',
  address: ' Makati City ',
});

await customerAuth.requestCustomerPasswordReset(' Customer@ServEase.test ');

const registrationResponse = await registrationRoute.POST(
  jsonRequest({
    fullName: ' Customer User ',
    email: ' Customer@ServEase.test ',
    password: 'password123',
    contactNumber: '0917 123 4567',
    address: ' Makati City ',
  }),
);
assert.equal(registrationResponse.status, 201);

const passwordResetResponse = await passwordResetRoute.POST(
  jsonRequest({
    email: ' Customer@ServEase.test ',
    redirectTo: 'https://servease.test/login',
  }),
);
assert.equal(passwordResetResponse.status, 200);

assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
  fullName: ' Customer User ',
  email: ' Customer@ServEase.test ',
  password: 'password123',
  contactNumber: '0917 123 4567',
  address: ' Makati City ',
});
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  email: ' Customer@ServEase.test ',
});
assert.deepEqual(JSON.parse(String(calls[2]?.init?.body)), {
  role: 'customer',
  email: 'customer@servease.test',
  password: 'password123',
  fullName: 'Customer User',
  contactNumber: '+639171234567',
  address: 'Makati City',
});
assert.deepEqual(JSON.parse(String(calls[3]?.init?.body)), {
  email: 'customer@servease.test',
  redirectTo: 'https://servease.test/login',
});

function jsonRequest(body: unknown): Request {
  return new Request('http://landing.test', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
