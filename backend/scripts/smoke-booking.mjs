import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:booking`);
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
const cleanupState = {
  userId: null,
  providerUserId: null,
  bookingId: null,
  categoryId: null,
  serviceId: null,
  providerId: null,
};

async function main() {
  const email = `servease-booking-smoke-${randomUUID()}@example.test`;
  const providerEmail = `servease-booking-provider-smoke-${randomUUID()}@example.test`;
  const password = `Smoke-${randomUUID()}-A1!`;
  const user = await createAuthUser(email, password);
  const providerUser = await createAuthUser(providerEmail, password);
  cleanupState.userId = user.id;
  cleanupState.providerUserId = providerUser.id;

  const { error: customerSeedError } = await serviceClient.rpc('servease_smoke_seed_customer', {
    p_user_id: user.id,
    p_email: email,
  });
  if (customerSeedError) {
    throw new Error(`Failed to seed smoke customer: ${customerSeedError.message}`);
  }
  const catalogSeed = await seedCatalog();
  await bindProviderUser(catalogSeed.providerId, providerUser.id, providerEmail);
  const scheduledAt = nextManilaSlotIso(10);
  const outsideWindowAt = nextManilaSlotIso(20);
  await seedAvailability(catalogSeed.providerId, scheduledAt);
  const accessToken = await signIn(email, password);
  const providerToken = await signIn(providerEmail, password);

  await startService('auth-service', 8501);
  await startService('catalog-service', 8503);
  await startService('booking-service', 8504);
  await startService('api-gateway', 5001);

  const created = await postJson('http://localhost:5001/v1/bookings', accessToken, {
    providerId: catalogSeed.providerId,
    serviceId: catalogSeed.serviceId,
    serviceTitle: 'Smoke Deep Clean Package',
    serviceName: 'Smoke Deep Clean',
    serviceDescription: 'Temporary smoke test booking',
    serviceAddress: '123 Smoke Test St',
    scheduledAt,
    hoursRequired: 1,
    serviceAmount: 1200,
    pricingMode: 'flat',
    paymentMethod: 'cash_on_service',
    customerNotes: 'Smoke test booking',
  });
  cleanupState.bookingId = created.id;

  const listed = await getJson('http://localhost:5001/v1/bookings', accessToken);
  if (!Array.isArray(listed) || !listed.some((booking) => booking.id === created.id)) {
    throw new Error('Created booking was not returned by customer booking list');
  }

  const detail = await getJson(
    `http://localhost:5001/v1/bookings/${created.id}`,
    accessToken,
  );
  if (detail.id !== created.id || detail.customerId !== user.id) {
    throw new Error('Created booking detail was not visible to the customer');
  }

  await expectPostError(
    'http://localhost:5001/v1/bookings',
    accessToken,
    {
      providerId: catalogSeed.providerId,
      serviceId: catalogSeed.serviceId,
      serviceTitle: 'Smoke Deep Clean Package',
      serviceName: 'Smoke Deep Clean',
      serviceDescription: 'Temporary smoke test overlap booking',
      serviceAddress: '123 Smoke Test St',
      scheduledAt,
      hoursRequired: 1,
      serviceAmount: 1200,
      pricingMode: 'flat',
      paymentMethod: 'cash_on_service',
    },
    409,
    'provider_unavailable',
  );

  await expectPostError(
    'http://localhost:5001/v1/bookings',
    accessToken,
    {
      providerId: catalogSeed.providerId,
      serviceId: catalogSeed.serviceId,
      serviceTitle: 'Smoke Deep Clean Package',
      serviceName: 'Smoke Deep Clean',
      serviceDescription: 'Temporary smoke test outside-window booking',
      serviceAddress: '123 Smoke Test St',
      scheduledAt: outsideWindowAt,
      hoursRequired: 1,
      serviceAmount: 1200,
      pricingMode: 'flat',
      paymentMethod: 'cash_on_service',
    },
    409,
    'provider_unavailable',
  );

  const confirmed = await patchJson(
    `http://localhost:5001/v1/bookings/${created.id}/status`,
    providerToken,
    {
      currentStatus: 'pending',
      nextStatus: 'confirmed',
    },
  );

  const inProgress = await patchJson(
    `http://localhost:5001/v1/bookings/${created.id}/status`,
    providerToken,
    {
      currentStatus: 'confirmed',
      nextStatus: 'in_progress',
    },
  );

  const completed = await patchJson(
    `http://localhost:5001/v1/bookings/${created.id}/status`,
    providerToken,
    {
      currentStatus: 'in_progress',
      nextStatus: 'completed',
    },
  );

  if (
    created.status !== 'pending' ||
    confirmed.status !== 'confirmed' ||
    inProgress.status !== 'in_progress' ||
    completed.status !== 'completed'
  ) {
    throw new Error('Booking status smoke sequence returned unexpected states');
  }

  console.log(
    JSON.stringify({
      ok: true,
      bookingId: created.id,
      createdStatus: created.status,
      finalStatus: completed.status,
      conflictError: 'provider_unavailable',
    }),
  );
}

async function createAuthUser(email, password) {
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create smoke auth user: ${error?.message ?? 'missing user'}`);
  }

  return data.user;
}

async function seedCatalog() {
  const { data, error } = await serviceClient.rpc('servease_smoke_seed_catalog');

  if (error || !data) {
    throw new Error(`Failed to seed catalog smoke data: ${error?.message ?? 'missing seed data'}`);
  }

  cleanupState.categoryId = data.categoryId;
  cleanupState.serviceId = data.serviceId;
  cleanupState.providerId = data.providerId;

  return data;
}

async function bindProviderUser(providerId, userId, email) {
  const { error } = await serviceClient.rpc('servease_smoke_bind_provider_user', {
    p_provider_id: providerId,
    p_user_id: userId,
    p_email: email,
  });
  if (error) {
    throw new Error(`Failed to bind smoke provider user: ${error.message}`);
  }
}

async function seedAvailability(providerId, scheduledAt) {
  const { error } = await serviceClient.rpc('servease_smoke_seed_provider_availability', {
    p_provider_id: providerId,
    p_scheduled_at: scheduledAt,
  });

  if (error) {
    throw new Error(`Failed to seed smoke availability: ${error.message}`);
  }
}

async function signIn(email, password) {
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(`Failed to sign in smoke user: ${error?.message ?? 'missing session'}`);
  }

  return data.session.access_token;
}

async function postJson(url, token, body) {
  return sendJson(url, 'POST', token, body);
}

async function getJson(url, token) {
  return sendJson(url, 'GET', token);
}

async function expectPostError(url, token, body, expectedStatus, expectedCode) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (
    response.status !== expectedStatus ||
    payload?.error?.code !== expectedCode
  ) {
    throw new Error(
      `Expected ${expectedStatus} ${expectedCode}, received ${response.status}: ${JSON.stringify(payload)}`,
    );
  }
}

async function patchJson(url, token, body) {
  return sendJson(url, 'PATCH', token, body);
}

async function sendJson(url, method, token, body) {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${url} failed with ${response.status}: ${JSON.stringify(payload)}`);
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function nextManilaSlotIso(hour) {
  const target = new Date(Date.now() + 2 * 86400000);
  target.setUTCHours(hour - 8, 0, 0, 0);
  return target.toISOString();
}

async function cleanup() {
  for (const child of processes.reverse()) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  if (cleanupState.bookingId) {
    await serviceClient.rpc('servease_smoke_cleanup_booking', {
      p_booking_id: cleanupState.bookingId,
    });
  }

  if (cleanupState.categoryId && cleanupState.serviceId && cleanupState.providerId) {
    await serviceClient.rpc('servease_smoke_cleanup_provider_availability', {
      p_provider_id: cleanupState.providerId,
    });

    await serviceClient.rpc('servease_smoke_cleanup_catalog', {
      p_category_id: cleanupState.categoryId,
      p_service_id: cleanupState.serviceId,
      p_provider_id: cleanupState.providerId,
    });
  }

  if (cleanupState.userId) {
    await serviceClient.rpc('servease_smoke_cleanup_customer', {
      p_user_id: cleanupState.userId,
    });
    await serviceClient.auth.admin.deleteUser(cleanupState.userId);
  }

  if (cleanupState.providerUserId) {
    await serviceClient.rpc('servease_smoke_cleanup_customer', {
      p_user_id: cleanupState.providerUserId,
    });
    await serviceClient.auth.admin.deleteUser(cleanupState.providerUserId);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
  });
