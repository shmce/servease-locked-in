import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ProviderRegistrationDraft } from '../src/app/lib/provider-registration';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const providerRegistration = await import('../src/app/lib/provider-registration');
const registrationRoute = await import('../src/app/api/provider-registration/route');

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (url === '/api/provider-registration') {
    return jsonResponse(201, {
      data: {
        user: {
          id: 'provider-user-1',
          email: 'provider@example.test',
        },
        providerApplication: {
          applicationReference: 'PA-TEST-001',
          verificationStatus: 'pending',
        },
      },
    });
  }

  if (url === 'http://gateway.test/v1/auth/register') {
    return jsonResponse(201, {
      data: {
        user: {
          id: 'provider-user-1',
          email: 'provider@example.test',
        },
        providerApplication: {
          applicationReference: 'PA-TEST-001',
          verificationStatus: 'pending',
        },
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const draft: ProviderRegistrationDraft = {
  step1: {
    fullName: ' Provider User ',
    email: ' Provider@ServEase.test ',
    birthdate: '1990-05-23',
    password: 'ProviderPass123',
    contactNumber: '912 345 6789',
  },
  step2: {
    businessName: ' Provider Cleaning ',
    primaryCategory: 'Domestic & Cleaning Services',
    primaryCategoryId: '11111111-1111-4111-8111-111111111111',
    subCategory: 'Deep Cleaning',
    serviceId: '33333333-3333-4333-8333-333333333333',
    experienceYears: '3-5 years',
  },
  step3: {
    streetAddress: '123 Main Street',
    city: 'Quezon City',
    province: 'Metro Manila',
    zipCode: '1100',
    maxServiceRadius: 10,
  },
  step4: {
    idType: 'Philippine National ID (PhilID)',
    fileName: 'provider-id.png',
  },
};

await providerRegistration.submitProviderRegistration(draft);

const response = await registrationRoute.POST(
  new Request('http://landing.test/api/provider-registration', {
    method: 'POST',
    body: JSON.stringify(draft),
  }),
);
assert.equal(response.status, 201);

assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), draft);
assert.equal(calls[1]?.url, 'http://gateway.test/v1/auth/register');
assert.equal(calls[1]?.init?.method, 'POST');
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  role: 'provider',
  email: 'Provider@ServEase.test',
  password: 'ProviderPass123',
  fullName: 'Provider User',
  birthdate: '1990-05-23',
  contactNumber: '+639123456789',
  businessName: 'Provider Cleaning',
  serviceId: '33333333-3333-4333-8333-333333333333',
  serviceDescription:
    'Domestic & Cleaning Services - Deep Cleaning - 3-5 years',
  serviceArea: '123 Main Street, Quezon City, Metro Manila, 1100, 10km radius',
});

const incompleteResponse = await registrationRoute.POST(
  new Request('http://landing.test/api/provider-registration', {
    method: 'POST',
    body: JSON.stringify({
      ...draft,
      step2: {
        ...draft.step2,
        subCategory: '',
      },
    }),
  }),
);
assert.equal(incompleteResponse.status, 400);

const underageResponse = await registrationRoute.POST(
  new Request('http://landing.test/api/provider-registration', {
    method: 'POST',
    body: JSON.stringify({
      ...draft,
      step1: {
        ...draft.step1,
        birthdate: nextYearBirthdate(),
      },
    }),
  }),
);
assert.equal(underageResponse.status, 400);

const step4Source = readFileSync(
  join(process.cwd(), 'src/app/components/ProviderRegStep4.tsx'),
  'utf8',
);
const successSource = readFileSync(
  join(process.cwd(), 'src/app/components/ProviderRegSuccess.tsx'),
  'utf8',
);
assert.match(step4Source, /removeItem\("providerRegDocumentUploadWarning"\)/);
assert.match(successSource, /Document Upload:/);
assert.match(successSource, /Needs follow-up/);
assert.match(successSource, /Received for review/);

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

function nextYearBirthdate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
