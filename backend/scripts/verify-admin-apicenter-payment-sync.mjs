#!/usr/bin/env node
/**
 * Verifies that the admin APICenter payment sync migration is present.
 *
 * This script uses the backend Supabase service-role client instead of the
 * Supabase MCP, so it can be run after applying
 * 20260519_add_admin_apicenter_payment_sync.sql to confirm the service RPCs
 * are callable.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for admin APICenter payment sync verification`);
  }
}

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const expectedPaymentColumns = [
  'apicenter_checkout_id',
  'apicenter_checkout_status',
  'apicenter_provider',
  'apicenter_provider_mode',
];

async function main() {
  const { data: payments, error: listError } = await serviceClient.rpc(
    'servease_admin_list_payments',
    { p_status: null },
  );

  if (listError) {
    throw new Error(
      `servease_admin_list_payments is not callable: ${listError.message}`,
    );
  }

  const firstPayment = Array.isArray(payments) ? payments[0] : null;
  if (firstPayment) {
    const missing = expectedPaymentColumns.filter(
      (column) => !(column in firstPayment),
    );
    if (missing.length > 0) {
      throw new Error(
        `servease_admin_list_payments is missing columns: ${missing.join(', ')}`,
      );
    }
  }

  const { error: checkoutError } = await serviceClient.rpc(
    'servease_admin_get_apicenter_checkout_for_payment',
    { p_payment_id: randomUUID() },
  );

  if (!checkoutError) {
    throw new Error(
      'Expected a missing checkout lookup to raise payment_not_found',
    );
  }

  if (!checkoutError.message.includes('payment_not_found')) {
    throw new Error(
      `Unexpected checkout lookup error: ${checkoutError.message}`,
    );
  }

  console.log('Admin APICenter payment sync RPCs are present and callable.');
  if (!firstPayment) {
    console.log(
      'No payment rows were returned, so response column shape could not be sampled.',
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
