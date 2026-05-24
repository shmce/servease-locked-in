import { createClient } from '@supabase/supabase-js';
import { loadBackendEnv } from './load-backend-env.mjs';
import process from 'node:process';

loadBackendEnv();

const seedBatchId =
  process.env.MOBILE_PRODUCTION_SEED_BATCH_ID ?? 'mobile_seed_2026_05_23';
const databaseUsers = {
  customer: 'mobile.customer.seed@servease.test',
  provider: 'mobile.provider.seed@servease.test',
  admin: 'mobile.admin.seed@servease.test',
};
const databaseUserIds = {
  customer: 'a0c9b6a1-7760-5044-ad1b-aea3abf2430d',
  provider: '6b3db75c-634b-566a-ac60-387873990b2b',
  admin: '6d049eda-9583-54e6-94c1-f3f436050f65',
};
const expectedTableCounts = {
  'identity_and_user.users': 14,
  'identity_and_user.customer_profiles': 1,
  'identity_and_user.user_addresses': 1,
  'provider_catalog.service_categories': 3,
  'provider_catalog.services': 4,
  'provider_catalog.provider_profiles': 12,
  'provider_catalog.provider_services': 12,
  'booking.bookings': 16,
  'booking.booking_timeline_events': 4,
  'booking.booking_service_updates': 2,
  'booking.booking_live_locations': 2,
  'messages.conversations': 4,
  'messages.messages': 16,
  'notification_and_support.notifications': 4,
  'notification_and_support.support_tickets': 6,
  'notification_and_support.support_ticket_replies': 3,
  'payment.payments': 10,
  'trust_and_reputation.reviews': 4,
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
        totalRows: expectedTotalRows,
        demoUsers: databaseUsers,
        demoUserIds: databaseUserIds,
        tableCounts: expectedTableCounts,
        applyCommand:
          'CONFIRM_MOBILE_PRODUCTION_SEED=mobile_seed_2026_05_23 node scripts/seed-mobile-production-like-data.mjs --apply',
        cleanupCommand:
          'CONFIRM_MOBILE_PRODUCTION_SEED=mobile_seed_2026_05_23 node scripts/seed-mobile-production-like-data.mjs --cleanup',
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
      `${key} is required for mobile production-like seed ${mode}`,
    );
  }
}

if (process.env.CONFIRM_MOBILE_PRODUCTION_SEED !== seedBatchId) {
  throw new Error(
    `Set CONFIRM_MOBILE_PRODUCTION_SEED=${seedBatchId} to run ${mode}.`,
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
    const cleaned = await cleanupSeed();
    const deletedAuthUsers = await deleteSeedAuthUsers();
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode,
          seedBatchId,
          result: cleaned,
          authUsersDeleted: deletedAuthUsers,
        },
        null,
        2,
      ),
    );
    return;
  }

  const deletedAuthUsers = await deleteSeedAuthUsers();

  const { data, error } = await serviceClient.rpc(
    'servease_seed_mobile_production_like_data',
    {
      p_seed_batch_id: seedBatchId,
      p_customer_user_id: databaseUserIds.customer,
      p_provider_user_id: databaseUserIds.provider,
      p_admin_user_id: databaseUserIds.admin,
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to seed mobile production-like data: ${error?.message ?? 'missing result'}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode,
        seedBatchId,
        databaseOnly: true,
        demoUsers: databaseUsers,
        demoUserIds: databaseUserIds,
        authUsersDeleted: deletedAuthUsers,
        result: data,
      },
      null,
      2,
    ),
  );
}

async function cleanupSeed() {
  const { data, error } = await serviceClient.rpc(
    'servease_cleanup_mobile_production_like_data',
    {
      p_seed_batch_id: seedBatchId,
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to cleanup mobile production-like seed: ${error?.message ?? 'missing result'}`,
    );
  }

  return data;
}

async function deleteAuthUserByEmail(email) {
  const existing = await findAuthUserByEmail(email);
  if (!existing) {
    return null;
  }

  const { error } = await serviceClient.auth.admin.deleteUser(existing.id);
  if (error) {
    throw new Error(`Failed to delete auth user ${email}: ${error.message}`);
  }

  return email;
}

async function deleteSeedAuthUsers() {
  const deleted = await Promise.all(
    Object.values(databaseUsers).map(deleteAuthUserByEmail),
  );
  return deleted.filter(Boolean);
}

async function findAuthUserByEmail(email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match || data.users.length < 1000) {
      return match ?? null;
    }
  }
  return null;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
