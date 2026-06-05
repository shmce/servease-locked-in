import { createClient } from '@supabase/supabase-js';
import { loadBackendEnv } from './load-backend-env.mjs';
import process from 'node:process';

loadBackendEnv();

const seedBatchId =
  process.env.ANALYTICS_PRODUCTION_SEED_BATCH_ID ?? 'lkr_seed_2026_05_23';

const totalCustomers = Number(
  process.env.ANALYTICS_SEED_TOTAL_CUSTOMERS ?? '200',
);
const totalProviders = Number(
  process.env.ANALYTICS_SEED_TOTAL_PROVIDERS ?? '50',
);
const totalBookings = Number(
  process.env.ANALYTICS_SEED_TOTAL_BOOKINGS ?? '3000',
);
const monthsOfHistory = Number(
  process.env.ANALYTICS_SEED_MONTHS_OF_HISTORY ?? '12',
);

const expectedTableCounts = {
  'identity_and_user.users': totalCustomers + totalProviders + 1,
  'identity_and_user.customer_profiles': totalCustomers,
  'identity_and_user.user_addresses':
    totalCustomers + Math.floor(totalCustomers / 4),
  'provider_catalog.service_categories': 6,
  'provider_catalog.services': 18,
  'provider_catalog.provider_profiles': totalProviders,
  'provider_catalog.provider_services': totalProviders * 3,
  'booking.bookings': totalBookings,
  'payment.payments': Math.round(totalBookings * 0.9), // pending+rejected (~10%) excluded
  'trust_and_reputation.reviews': Math.round(totalBookings * 0.6 * 0.85), // ~60% completed * 85% reviewed
  'messages.conversations': Math.round(totalBookings / 5),
  'messages.messages': Math.round(totalBookings / 5) * 7,
  'notification_and_support.support_tickets': 120,
  'notification_and_support.support_ticket_replies': 150,
  'notification_and_support.notifications': 800,
};

const expectedTotalRows = Object.values(expectedTableCounts).reduce(
  (sum, count) => sum + count,
  0,
);

const mode = process.argv.includes('--apply')
  ? 'apply'
  : process.argv.includes('--cleanup')
    ? 'cleanup'
    : 'dry-run';

if (mode === 'dry-run') {
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode,
        seedBatchId,
        databaseOnly: true,
        params: {
          totalCustomers,
          totalProviders,
          totalBookings,
          monthsOfHistory,
        },
        approximateTotalRows: expectedTotalRows,
        approximateTableCounts: expectedTableCounts,
        applyCommand: `CONFIRM_ANALYTICS_PRODUCTION_SEED=${seedBatchId} node scripts/seed-analytics-production-like-data.mjs --apply`,
        cleanupCommand: `CONFIRM_ANALYTICS_PRODUCTION_SEED=${seedBatchId} node scripts/seed-analytics-production-like-data.mjs --cleanup`,
        note: 'Approximations: payments exclude pending+rejected, reviews depend on hash-of-reference distribution. The actual seeded counts are returned by --apply.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(
      `${key} is required for analytics production-like seed ${mode}`,
    );
  }
}

if (process.env.CONFIRM_ANALYTICS_PRODUCTION_SEED !== seedBatchId) {
  throw new Error(
    `Set CONFIRM_ANALYTICS_PRODUCTION_SEED=${seedBatchId} to run ${mode}.`,
  );
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

async function main() {
  if (mode === 'cleanup') {
    const { data, error } = await serviceClient.rpc(
      'servease_cleanup_analytics_production_like_data',
      { p_seed_batch_id: seedBatchId },
    );
    if (error || !data) {
      throw new Error(
        `Failed to cleanup analytics production-like seed: ${error?.message ?? 'missing result'}`,
      );
    }
    console.log(
      JSON.stringify({ ok: true, mode, seedBatchId, result: data }, null, 2),
    );
    return;
  }

  const { data, error } = await serviceClient.rpc(
    'servease_seed_analytics_production_like_data',
    {
      p_seed_batch_id: seedBatchId,
      p_total_customers: totalCustomers,
      p_total_providers: totalProviders,
      p_total_bookings: totalBookings,
      p_months_of_history: monthsOfHistory,
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to seed analytics production-like data: ${error?.message ?? 'missing result'}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode,
        seedBatchId,
        params: {
          totalCustomers,
          totalProviders,
          totalBookings,
          monthsOfHistory,
        },
        result: data,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
