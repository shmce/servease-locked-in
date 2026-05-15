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
    throw new Error(`${key} is required for smoke:availability`);
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
  providerId: null,
};

async function main() {
  const email = `servease-availability-smoke-${randomUUID()}@example.test`;
  const password = `Smoke-${randomUUID()}-A1!`;
  const user = await createAuthUser(email, password);
  cleanupState.userId = user.id;
  cleanupState.providerId = await seedProviderAccount(user.id, email);
  const accessToken = await signIn(email, password);

  await startService('catalog-service', 8503);
  await startService('availability-service', 8505);
  await startService('api-gateway', 5001);

  const windows = weekdays().map((dayOfWeek) => ({
    dayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  }));

  const replaced = await sendJson(
    'http://localhost:5001/v1/provider/availability/windows',
    'PUT',
    accessToken,
    { windows },
  );

  if (replaced.providerId !== cleanupState.providerId || replaced.windows.length !== 7) {
    throw new Error('Availability windows were not replaced for the smoke provider');
  }

  await expectJsonError(
    'http://localhost:5001/v1/provider/availability/windows',
    'PUT',
    accessToken,
    {
      windows: [
        {
          dayOfWeek: 'monday',
          startTime: '17:00',
          endTime: '09:00',
        },
      ],
    },
    400,
    'invalid_availability_request',
  );

  const offDate = futureDate();
  const withDayOff = await sendJson(
    'http://localhost:5001/v1/provider/availability/days-off',
    'POST',
    accessToken,
    {
      offDate,
      reason: 'Smoke test day off',
    },
  );

  if (!withDayOff.daysOff.some((dayOff) => dayOff.offDate === offDate)) {
    throw new Error('Smoke day off was not returned after creation');
  }

  const afterRemove = await sendJson(
    `http://localhost:5001/v1/provider/availability/days-off/${offDate}`,
    'DELETE',
    accessToken,
  );

  if (afterRemove.daysOff.some((dayOff) => dayOff.offDate === offDate)) {
    throw new Error('Smoke day off was not removed');
  }

  const fetched = await sendJson(
    'http://localhost:5001/v1/provider/availability',
    'GET',
    accessToken,
  );

  if (fetched.providerId !== cleanupState.providerId || fetched.windows.length !== 7) {
    throw new Error('Fetched availability did not match the smoke provider');
  }

  console.log(
    JSON.stringify({
      ok: true,
      providerId: cleanupState.providerId,
      windows: fetched.windows.length,
      invalidWindowError: 'invalid_availability_request',
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

async function seedProviderAccount(userId, email) {
  const { data, error } = await serviceClient.rpc('servease_smoke_seed_provider_account', {
    p_user_id: userId,
    p_email: email,
  });

  if (error || !data) {
    throw new Error(`Failed to seed smoke provider: ${error?.message ?? 'missing provider id'}`);
  }

  return data;
}

async function signIn(email, password) {
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(`Failed to sign in smoke provider: ${error?.message ?? 'missing session'}`);
  }

  return data.session.access_token;
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

async function expectJsonError(url, method, token, body, expectedStatus, expectedCode) {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (response.status !== expectedStatus || payload?.error?.code !== expectedCode) {
    throw new Error(
      `Expected ${expectedStatus} ${expectedCode}, received ${response.status}: ${JSON.stringify(payload)}`,
    );
  }
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

function weekdays() {
  return [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
}

function futureDate() {
  const date = new Date(Date.now() + 7 * 86400000);
  return date.toISOString().slice(0, 10);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function cleanup() {
  for (const child of processes.reverse()) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  if (cleanupState.providerId) {
    await serviceClient.rpc('servease_smoke_cleanup_provider_availability', {
      p_provider_id: cleanupState.providerId,
    });
  }

  if (cleanupState.userId) {
    await serviceClient.rpc('servease_smoke_cleanup_provider_account', {
      p_user_id: cleanupState.userId,
    });
    await serviceClient.auth.admin.deleteUser(cleanupState.userId);
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
