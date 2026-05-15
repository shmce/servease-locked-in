import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createSupabaseClient(keyEnvName: string): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env[keyEnvName];

  if (!url || !key) {
    throw new Error(`SUPABASE_URL and ${keyEnvName} are required`);
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createSupabaseServiceClient(): SupabaseClient {
  return createSupabaseClient('SUPABASE_SERVICE_ROLE_KEY');
}

export function createSupabaseAuthClient(): SupabaseClient {
  return createSupabaseClient('SUPABASE_PUBLISHABLE_KEY');
}
