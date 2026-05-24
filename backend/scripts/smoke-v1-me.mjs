import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { loadBackendEnv } from './load-backend-env.mjs';
import process from 'node:process';

loadBackendEnv();

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:v1-me`);
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

const userIdRef = { value: null };
const processes = [];

async function main() {
  const email = `servease-smoke-${randomUUID()}@example.test`;
  const password = `Smoke-${randomUUID()}-A1!`;

  const createdUser = await createAuthUser(email, password);
  userIdRef.value = createdUser.id;

  await seedProfileRows(createdUser.id, email);
  const accessToken = await signIn(email, password);

  await startService('auth-service', 8501);
  await startService('user-service', 8502);
  await startService('catalog-service', 8503);
  await startService('api-gateway', 5001);

  const response = await fetch('http://localhost:5001/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      `GET /v1/me failed with ${response.status}: ${JSON.stringify(body)}`,
    );
  }

  if (body.data.user.id !== createdUser.id) {
    throw new Error('GET /v1/me returned the wrong user id');
  }

  if (body.data.user.passwordHash || body.data.user.password_hash) {
    throw new Error('GET /v1/me leaked a password hash field');
  }

  console.log(
    JSON.stringify({
      ok: true,
      route: '/v1/me',
      userId: body.data.user.id,
      role: body.data.user.role,
      customerProfile: Boolean(body.data.customerProfile),
      providerProfile: Boolean(body.data.providerProfile),
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
    throw new Error(
      `Failed to create smoke auth user: ${error?.message ?? 'missing user'}`,
    );
  }

  return data.user;
}

async function seedProfileRows(userId, email) {
  const { error } = await serviceClient.rpc('servease_smoke_seed_customer', {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    throw new Error(`Failed to seed smoke profile rows: ${error.message}`);
  }
}

async function signIn(email, password) {
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(
      `Failed to sign in smoke user: ${error?.message ?? 'missing session'}`,
    );
  }

  return data.session.access_token;
}

async function startService(appName, port) {
  const child = spawn('node', [`dist/apps/${appName}/src/main.js`], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: appName === 'api-gateway' ? String(port) : process.env.PORT,
    },
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

async function cleanup() {
  for (const child of processes.reverse()) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  if (userIdRef.value) {
    await serviceClient.rpc('servease_smoke_cleanup_customer', {
      p_user_id: userIdRef.value,
    });

    await serviceClient.auth.admin.deleteUser(userIdRef.value);
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
