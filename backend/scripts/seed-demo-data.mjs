import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for seed:demo`);
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

const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'ServEaseDemo#2026';
const demo = {
  customer: {
    email: process.env.DEMO_CUSTOMER_EMAIL ?? 'customer.demo@servease.test',
    fullName: 'Casey Demo Customer',
    contactNumber: '+639170001001',
    address: 'Unit 12B Greenfield Residences, Mandaluyong City',
  },
  provider: {
    email: process.env.DEMO_PROVIDER_EMAIL ?? 'provider.demo@servease.test',
    fullName: 'Priya Demo Provider',
    contactNumber: '+639170002002',
    businessName: 'GreenFix Home Services',
    serviceArea: 'Mandaluyong, Pasig, Makati',
  },
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL ?? 'admin.demo@servease.test',
    fullName: 'Admin Demo User',
    contactNumber: '+639170003003',
  },
};

async function main() {
  const customer = await ensureAuthUser(demo.customer.email, password);
  const provider = await ensureAuthUser(demo.provider.email, password);
  const admin = await ensureAuthUser(demo.admin.email, password);

  const seed = await seedDemoData(customer.id, provider.id, admin.id);
  const liveLocation = await seedDemoLiveLocation(seed.bookingId, seed.providerId);
  const rankingSeed = await seedDemoRankingCatalog();
  const disputeId = await seedDemoDispute(customer.id);
  const payoutMethodId = await seedDemoPayoutMethod(seed.providerId);
  const refundId = await seedDemoRefundRequest({
    customerId: customer.id,
    providerId: seed.providerId,
    bookingId: seed.bookingId,
    paymentId: seed.paymentId,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        password,
        accounts: {
          customer: demo.customer.email,
          provider: demo.provider.email,
          admin: demo.admin.email,
        },
        ids: {
          customerUserId: customer.id,
          providerUserId: provider.id,
          adminUserId: admin.id,
          providerId: seed.providerId,
          bookingId: seed.bookingId,
          liveLocation,
          refundId,
          disputeId,
          payoutMethodId,
          ranking: rankingSeed,
        },
      },
      null,
      2,
    ),
  );
}

async function seedDemoRefundRequest({ customerId, providerId, bookingId, paymentId }) {
  const refundId = 'abababab-abab-4aba-8aba-abababababab';
  const { data, error } = await serviceClient.rpc('servease_seed_demo_refund_request', {
    p_refund_id: refundId,
    p_payment_id: paymentId,
    p_booking_id: bookingId,
    p_customer_id: customerId,
    p_provider_id: providerId,
    p_amount: 1500,
    p_reason: 'Customer requested refund review for the demo booking.',
  });

  if (error || !data) {
    throw new Error(`Failed to seed demo refund request: ${error?.message ?? 'missing refund id'}`);
  }

  return data;
}

async function seedDemoRankingCatalog() {
  const { data, error } = await serviceClient.rpc('servease_seed_demo_ranking_catalog');

  if (error || !data) {
    throw new Error(`Failed to seed demo ranking catalog: ${error?.message ?? 'missing ranking seed result'}`);
  }

  return data;
}

async function seedDemoDispute(customerId) {
  const { data, error } = await serviceClient.rpc('servease_seed_demo_dispute', {
    p_customer_id: customerId,
  });

  if (error || !data) {
    throw new Error(`Failed to seed demo dispute: ${error?.message ?? 'missing dispute id'}`);
  }

  return data;
}

async function seedDemoLiveLocation(bookingId, providerId) {
  const { data, error } = await serviceClient.rpc('servease_upsert_booking_live_location', {
    p_booking_id: bookingId,
    p_provider_id: providerId,
    p_latitude: 14.5816,
    p_longitude: 121.0569,
    p_accuracy_meters: 18,
    p_heading_degrees: 42,
    p_speed_mps: 1.2,
  });

  if (error || !data) {
    throw new Error(`Failed to seed demo live location: ${error?.message ?? 'missing location'}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error('Failed to seed demo live location: missing location');
  }

  return {
    latitude: row.latitude,
    longitude: row.longitude,
    updatedAt: row.updated_at,
  };
}

async function seedDemoPayoutMethod(providerId) {
  const { data, error } = await serviceClient.rpc('servease_seed_demo_payout_method', {
    p_provider_id: providerId,
  });

  if (error || !data) {
    throw new Error(`Failed to seed demo payout method: ${error?.message ?? 'missing method id'}`);
  }

  return data;
}

async function ensureAuthUser(email, nextPassword) {
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    const { data, error } = await serviceClient.auth.admin.updateUserById(
      existing.id,
      {
        email,
        password: nextPassword,
        email_confirm: true,
      },
    );
    if (error || !data.user) {
      throw new Error(`Failed to update demo auth user ${email}: ${error?.message ?? 'missing user'}`);
    }
    return data.user;
  }

  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password: nextPassword,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Failed to create demo auth user ${email}: ${error?.message ?? 'missing user'}`);
  }
  return data.user;
}

async function seedDemoData(customerId, providerUserId, adminId) {
  const { data, error } = await serviceClient.rpc('servease_seed_demo_data', {
    p_customer_id: customerId,
    p_provider_user_id: providerUserId,
    p_admin_id: adminId,
    p_customer_email: demo.customer.email,
    p_provider_email: demo.provider.email,
    p_admin_email: demo.admin.email,
  });

  if (error || !data) {
    throw new Error(`Failed to seed demo data: ${error?.message ?? 'missing seed result'}`);
  }

  return data;
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
