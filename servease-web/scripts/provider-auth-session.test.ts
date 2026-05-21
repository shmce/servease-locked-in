import assert from 'node:assert/strict';
import type { CurrentUserProfile } from '../src/services/serveaseProviderApi';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.test/';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-key';

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

const calls: FetchCall[] = [];
const memoryStorage = createMemoryStorage();

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: globalThis,
});
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  calls.push({ url, init });

  if (
    url ===
    'https://project.supabase.test/auth/v1/token?grant_type=password'
  ) {
    return jsonResponse(200, {
      access_token: 'access-token-1',
      refresh_token: 'refresh-token-1',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'provider-user-1',
        email: 'provider@servease.test',
      },
    });
  }

  if (
    url ===
    'https://project.supabase.test/auth/v1/token?grant_type=refresh_token'
  ) {
    return jsonResponse(200, {
      access_token: 'access-token-2',
      refresh_token: 'refresh-token-2',
      expires_in: 7200,
      token_type: 'bearer',
      user: {
        id: 'provider-user-1',
        email: 'provider@servease.test',
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const providerApi = await import('../src/services/serveaseProviderApi');

const passwordSession = await providerApi.signInWithPassword(
  ' provider@servease.test ',
  'secret-password',
);
assert.equal(passwordSession.accessToken, 'access-token-1');
assert.equal(passwordSession.refreshToken, 'refresh-token-1');
assert.equal(passwordSession.expiresIn, 3600);

const passwordHeaders = calls[0]?.init?.headers as Record<string, string>;
assert.equal(passwordHeaders.apikey, 'publishable-key');
assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
  email: 'provider@servease.test',
  password: 'secret-password',
});

const refreshedSession = await providerApi.refreshSupabaseSession(
  ' refresh-token-1 ',
);
assert.equal(refreshedSession.accessToken, 'access-token-2');
assert.equal(refreshedSession.refreshToken, 'refresh-token-2');
assert.equal(refreshedSession.expiresIn, 7200);
assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), {
  refresh_token: 'refresh-token-1',
});

const profile: CurrentUserProfile = {
  user: {
    id: 'provider-user-1',
    email: 'provider@servease.test',
    fullName: 'Provider User',
    contactNumber: null,
    role: 'provider',
    status: 'active',
  },
  customerProfile: null,
  providerProfile: {
    id: 'provider-profile-1',
    businessName: 'Servease Provider',
    verificationStatus: 'approved',
    averageRating: 5,
    reviewCount: 3,
  },
};

const beforeStore = Date.now();
providerApi.storeProviderSession('access-token-2', profile, refreshedSession);

assert.equal(providerApi.getStoredProviderAccessToken(), 'access-token-2');
assert.equal(providerApi.getStoredProviderRefreshToken(), 'refresh-token-2');
assert.ok(
  (providerApi.getStoredProviderTokenExpiresAt() ?? 0) >=
    beforeStore + 7200 * 1000,
);

providerApi.clearStoredProviderSession();
assert.equal(providerApi.getStoredProviderAccessToken(), null);
assert.equal(providerApi.getStoredProviderRefreshToken(), null);
assert.equal(providerApi.getStoredProviderTokenExpiresAt(), null);

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
