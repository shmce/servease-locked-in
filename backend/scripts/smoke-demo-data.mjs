import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:demo`);
  }
}

const gatewayUrl = 'http://localhost:5001';
const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'ServEaseDemo#2026';
const accounts = {
  customer: process.env.DEMO_CUSTOMER_EMAIL ?? 'customer.demo@servease.test',
  provider: process.env.DEMO_PROVIDER_EMAIL ?? 'provider.demo@servease.test',
  admin: process.env.DEMO_ADMIN_EMAIL ?? 'admin.demo@servease.test',
};
const expected = {
  categoryId: '11111111-1111-4111-8111-111111111111',
  serviceId: '33333333-3333-4333-8333-333333333333',
  providerId: '55555555-5555-4555-8555-555555555555',
  bookingId: '88888888-8888-4888-8888-888888888888',
  conversationId: '99999999-9999-4999-8999-999999999999',
  messageId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  paymentId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  supportTicketId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  notificationId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  disputeId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
};

const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
const processes = [];

async function main() {
  await startCoreServices();

  const [customerToken, providerToken, adminToken] = await Promise.all([
    signIn(accounts.customer),
    signIn(accounts.provider),
    signIn(accounts.admin),
  ]);

  const [customerMe, providerMe, adminMe] = await Promise.all([
    getJson('/v1/me', customerToken),
    getJson('/v1/me', providerToken),
    getJson('/v1/me', adminToken),
  ]);
  assert(customerMe.user.role === 'customer', 'customer /v1/me role mismatch');
  assert(providerMe.user.role === 'provider', 'provider /v1/me role mismatch');
  assert(adminMe.user.role === 'admin', 'admin /v1/me role mismatch');

  const [categories, services, providers, filteredProviders] = await Promise.all([
    getPublicJson('/v1/catalog/categories'),
    getPublicJson(`/v1/catalog/services?categoryId=${expected.categoryId}`),
    getPublicJson('/v1/catalog/providers'),
    getPublicJson(`/v1/catalog/providers?serviceId=${expected.serviceId}`),
  ]);
  assert(
    categories.some((item) => item.id === expected.categoryId),
    'demo category missing from catalog',
  );
  assert(
    services.some((item) => item.id === expected.serviceId),
    'demo service missing from catalog',
  );
  assert(
    providers.some((item) => item.providerId === expected.providerId),
    'demo provider missing from catalog',
  );
  assert(
    filteredProviders.some((item) => item.providerId === expected.providerId),
    'demo provider missing from filtered provider list',
  );

  const [portfolio, reviews, publicAvailability, privateAvailability] =
    await Promise.all([
      getPublicJson(`/v1/catalog/providers/${expected.providerId}/portfolio`),
      getPublicJson(`/v1/reviews?providerId=${expected.providerId}`),
      getPublicJson(`/v1/provider/availability/${expected.providerId}`),
      getJson('/v1/provider/availability', providerToken),
    ]);
  assert(Array.isArray(portfolio), 'demo provider portfolio did not return an array');
  assert(Array.isArray(reviews), 'demo provider reviews did not return an array');
  assert(publicAvailability.windows.length >= 1, 'public demo availability missing');
  assert(privateAvailability.windows.length >= 1, 'private demo availability missing');

  const [customerBookings, providerBookings] = await Promise.all([
    getJson('/v1/bookings', customerToken),
    getJson('/v1/bookings?scope=provider', providerToken),
  ]);
  assert(
    customerBookings.some((item) => item.id === expected.bookingId),
    'demo customer booking missing',
  );
  assert(
    providerBookings.some((item) => item.id === expected.bookingId),
    'demo provider booking missing',
  );

  const referralSummary = await getJson('/v1/referrals', customerToken);
  assert(
    referralSummary.referralCode.startsWith('SE-'),
    'demo referral summary missing code',
  );
  const userPreferences = await getJson('/v1/me/preferences', customerToken);
  assert(
    ['en', 'fil'].includes(userPreferences.language),
    'demo user preferences missing language',
  );

  const [
    updates,
    timeline,
    tracking,
    conversations,
    messages,
    payments,
    tickets,
    notifications,
  ] = await Promise.all([
    getJson(`/v1/bookings/${expected.bookingId}/service-updates`, customerToken),
    getJson(`/v1/bookings/${expected.bookingId}/timeline`, customerToken),
    getJson(`/v1/bookings/${expected.bookingId}/tracking`, customerToken),
    getJson('/v1/conversations', customerToken),
    getJson(`/v1/conversations/${expected.conversationId}/messages`, customerToken),
    getJson('/v1/payments', customerToken),
    getJson('/v1/support/tickets', customerToken),
    getJson('/v1/notifications', customerToken),
  ]);
  assert(updates.length >= 1, 'demo service updates missing');
  assert(timeline.length >= 2, 'demo timeline missing');
  assert(tracking.bookingId === expected.bookingId, 'demo tracking mismatch');
  assert(
    conversations.some((item) => item.id === expected.conversationId),
    'demo conversation missing',
  );
  assert(messages.some((item) => item.id === expected.messageId), 'demo message missing');
  assert(payments.some((item) => item.id === expected.paymentId), 'demo payment missing');
  const promotion = await postJson(
    '/v1/payments/promotions/validate',
    customerToken,
    {
      bookingId: expected.bookingId,
      code: 'SERVEASE10',
    },
  );
  assert(promotion.valid === true, 'demo promotion code was not valid');
  assert(
    promotion.discountAmount > 0 && promotion.finalAmount > 0,
    'demo promotion did not discount the booking amount',
  );
  assert(
    tickets.some((item) => item.id === expected.supportTicketId),
    'demo support ticket missing',
  );
  assert(
    notifications.some((item) => item.id === expected.notificationId),
    'demo notification missing',
  );

  const [
    adminPayments,
    adminTickets,
    adminDisputes,
    adminDisputeDetail,
    adminPromotions,
  ] =
    await Promise.all([
      getJson('/v1/admin/payments', adminToken),
      getJson('/v1/admin/support/tickets', adminToken),
      getJson('/v1/admin/disputes', adminToken),
      getJson(`/v1/admin/disputes/${expected.disputeId}`, adminToken),
      getJson('/v1/admin/promotions?status=active', adminToken),
    ]);
  assert(
    adminPayments.some((item) => item.id === expected.paymentId),
    'admin payment list missing demo payment',
  );
  assert(
    adminTickets.some((item) => item.id === expected.supportTicketId),
    'admin support list missing demo ticket',
  );
  assert(
    adminDisputes.some((item) => item.id === expected.disputeId),
    'admin dispute list missing demo dispute',
  );
  assert(
    adminDisputeDetail.id === expected.disputeId,
    'admin dispute detail missing demo dispute',
  );
  assert(
    adminPromotions.some((item) => item.code === 'SERVEASE10'),
    'admin promotion list missing demo promotion',
  );

  console.log(
    JSON.stringify({
      ok: true,
      demoGatewayVerified: true,
      bookingId: expected.bookingId,
      providerId: expected.providerId,
      mobileReadSurfacesVerified: true,
    }),
  );
}

async function startCoreServices() {
  await Promise.all([
    startService('auth-service', 8501),
    startService('user-service', 8502),
    startService('catalog-service', 8503),
    startService('booking-service', 8504),
    startService('availability-service', 8505),
    startService('messaging-service', 8506),
    startService('payment-service', 8507),
    startService('review-service', 8508),
    startService('notification-service', 8509),
    startService('support-service', 8510),
    startService('admin-service', 8511),
  ]);
  await startService('api-gateway', 5001);
}

async function signIn(email) {
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(`Failed demo sign-in for ${email}: ${error?.message ?? 'missing session'}`);
  }

  return data.session.access_token;
}

async function getJson(path, token) {
  const response = await fetch(`${gatewayUrl}${path}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`GET ${path} failed ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.data;
}

async function getPublicJson(path) {
  const response = await fetch(`${gatewayUrl}${path}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`GET ${path} failed ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.data;
}

async function postJson(path, token, body) {
  const response = await fetch(`${gatewayUrl}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`POST ${path} failed ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.data;
}

async function startService(appName, port) {
  const child = spawn('node', [`dist/apps/${appName}/src/main.js`], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  processes.push(child);

  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString();
  });

  await waitForHealthy(port, appName, () => logs);
}

async function waitForHealthy(port, appName, getLogs) {
  const deadline = Date.now() + 15000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${port}/health/live`);
      if (response.ok) {
        return;
      }
      lastError = new Error(`${appName} health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }

  throw new Error(
    `${appName} did not become healthy on port ${port}: ${lastError?.message ?? 'timeout'}\n${getLogs()}`,
  );
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    for (const child of processes.reverse()) {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }
  });
