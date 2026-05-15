import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signInWithPassword } from './supabaseAuth';

describe('supabaseAuth', () => {
  it('signs in with the Supabase password grant and publishable key', async () => {
    let requestBody: unknown = null;
    let apiKey: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(
        url,
        'https://project.supabase.co/auth/v1/token?grant_type=password',
      );
      assert.equal(init?.method, 'POST');
      apiKey = new Headers(init?.headers).get('apikey');
      requestBody = JSON.parse(String(init?.body));

      return jsonResponse({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user-1',
          email: 'customer@example.com',
        },
      });
    };

    const session = await signInWithPassword(
      {
        supabaseUrl: 'https://project.supabase.co',
        publishableKey: 'publishable-key',
        email: 'customer@example.com',
        password: 'password-1',
      },
      fetcher,
    );

    assert.equal(apiKey, 'publishable-key');
    assert.deepEqual(requestBody, {
      email: 'customer@example.com',
      password: 'password-1',
    });
    assert.equal(session.accessToken, 'access-token');
    assert.equal(session.user.email, 'customer@example.com');
  });

  it('rejects missing public Supabase configuration before fetching', async () => {
    let didFetch = false;
    const fetcher = async () => {
      didFetch = true;
      return jsonResponse({});
    };

    await assert.rejects(
      () =>
        signInWithPassword(
          {
            supabaseUrl: '',
            publishableKey: '',
            email: 'customer@example.com',
            password: 'password-1',
          },
          fetcher,
        ),
      /Supabase URL and publishable key are required/,
    );
    assert.equal(didFetch, false);
  });

  it('returns useful Supabase auth errors', async () => {
    const fetcher = async () =>
      jsonResponse(
        {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        },
        400,
      );

    await assert.rejects(
      () =>
        signInWithPassword(
          {
            supabaseUrl: 'https://project.supabase.co',
            publishableKey: 'publishable-key',
            email: 'customer@example.com',
            password: 'bad-password',
          },
          fetcher,
        ),
      /Invalid login credentials/,
    );
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
