import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:catalog`);
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

const processes = [];
const seeded = {
  categoryId: null,
  serviceId: null,
  providerId: null,
};

async function main() {
  const { data, error } = await serviceClient.rpc('servease_smoke_seed_catalog');

  if (error || !data) {
    throw new Error(`Failed to seed catalog smoke data: ${error?.message ?? 'missing seed data'}`);
  }

  seeded.categoryId = data.categoryId;
  seeded.serviceId = data.serviceId;
  seeded.providerId = data.providerId;

  await startService('catalog-service', 8503);
  await startService('api-gateway', 5001);

  const categories = await getData('http://localhost:5001/v1/catalog/categories');
  assertContains(categories, seeded.categoryId, 'category');

  const services = await getData(
    `http://localhost:5001/v1/catalog/services?categoryId=${seeded.categoryId}`,
  );
  assertContains(services, seeded.serviceId, 'service');

  const providers = await getData(
    `http://localhost:5001/v1/catalog/providers?serviceId=${seeded.serviceId}`,
  );
  assertContains(providers, data.listingId, 'provider listing');

  console.log(
    JSON.stringify({
      ok: true,
      routes: [
        '/v1/catalog/categories',
        '/v1/catalog/services',
        '/v1/catalog/providers',
      ],
      categoryId: seeded.categoryId,
      serviceId: seeded.serviceId,
      listingId: data.listingId,
    }),
  );
}

async function getData(url) {
  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}: ${JSON.stringify(body)}`);
  }

  return body.data;
}

function assertContains(items, id, label) {
  if (!Array.isArray(items) || !items.some((item) => item.id === id)) {
    throw new Error(`Smoke ${label} ${id} was not returned`);
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

  if (seeded.categoryId && seeded.serviceId && seeded.providerId) {
    await serviceClient.rpc('servease_smoke_cleanup_catalog', {
      p_category_id: seeded.categoryId,
      p_service_id: seeded.serviceId,
      p_provider_id: seeded.providerId,
    });
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
