export interface SignInRequest {
  supabaseUrl?: string;
  publishableKey?: string;
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  tokenType: string;
  user: {
    id: string;
    email: string | null;
  };
}

interface SupabaseTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: {
    id?: string;
    email?: string | null;
  };
  error?: string;
  error_description?: string;
  msg?: string;
}

export async function signInWithPassword(
  {
    supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL,
    publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    email,
    password,
  }: SignInRequest,
  fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch,
): Promise<AuthSession> {
  const normalizedUrl = supabaseUrl?.replace(/\/$/, '');
  const normalizedKey = publishableKey?.trim();

  if (!normalizedUrl || !normalizedKey) {
    throw new Error('Supabase URL and publishable key are required.');
  }

  const response = await fetcher(
    `${normalizedUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: normalizedKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    },
  );
  const payload = (await response.json()) as SupabaseTokenResponse;

  if (!response.ok) {
    throw new Error(
      payload.error_description ??
        payload.msg ??
        payload.error ??
        `Supabase sign-in failed with ${response.status}`,
    );
  }

  if (!payload.access_token || !payload.user?.id) {
    throw new Error('Supabase sign-in response did not include a session.');
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresIn: payload.expires_in ?? null,
    tokenType: payload.token_type ?? 'bearer',
    user: {
      id: payload.user.id,
      email: payload.user.email ?? null,
    },
  };
}
