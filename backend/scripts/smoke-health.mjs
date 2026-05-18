import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import process from 'node:process';

const services = [
  { app: 'auth-service', name: 'auth-service', port: 8701, portEnv: 'AUTH_SERVICE_PORT' },
  { app: 'user-service', name: 'user-service', port: 8702, portEnv: 'USER_SERVICE_PORT' },
  { app: 'catalog-service', name: 'catalog-service', port: 8703, portEnv: 'CATALOG_SERVICE_PORT' },
  { app: 'booking-service', name: 'booking-service', port: 8704, portEnv: 'BOOKING_SERVICE_PORT' },
  { app: 'availability-service', name: 'availability-service', port: 8705, portEnv: 'AVAILABILITY_SERVICE_PORT' },
  { app: 'messaging-service', name: 'messaging-service', port: 8706, portEnv: 'MESSAGING_SERVICE_PORT' },
  { app: 'payment-service', name: 'payment-service', port: 8707, portEnv: 'PAYMENT_SERVICE_PORT' },
  { app: 'review-service', name: 'review-service', port: 8708, portEnv: 'REVIEW_SERVICE_PORT' },
  { app: 'notification-service', name: 'notification-service', port: 8709, portEnv: 'NOTIFICATION_SERVICE_PORT' },
  { app: 'support-service', name: 'support-service', port: 8710, portEnv: 'SUPPORT_SERVICE_PORT' },
  { app: 'admin-service', name: 'admin-service', port: 8711, portEnv: 'ADMIN_SERVICE_PORT' },
  { app: 'api-gateway', name: 'api-gateway', port: 8700, portEnv: 'PORT' },
];

const processes = [];

async function main() {
  for (const service of services) {
    await startService(service);
  }

  console.log(
    JSON.stringify({
      ok: true,
      readOnly: true,
      services: services.map(({ name, port }) => ({ name, port })),
    }),
  );
}

async function startService(service) {
  const entry = `dist/apps/${service.app}/src/main.js`;
  if (!existsSync(entry)) {
    throw new Error(`Missing ${entry}. Run npm run build before smoke:health.`);
  }

  const env = {
    ...process.env,
    [service.portEnv]: String(service.port),
  };
  const child = spawn('node', [entry], {
    cwd: process.cwd(),
    env,
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

  await waitForHealthy(service, () => logs);
}

async function waitForHealthy(service, getLogs) {
  const deadline = Date.now() + 15000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${service.port}/health/live`);
      if (response.ok) {
        const payload = await response.json();
        if (payload.service === service.name) {
          return;
        }
        lastError = new Error(
          `${service.name} health returned wrong service: ${JSON.stringify(payload)}`,
        );
      } else {
        lastError = new Error(`${service.name} health returned ${response.status}`);
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `${service.name} did not become healthy on ${service.port}. Last error: ${
      lastError?.message ?? 'none'
    }\n${getLogs()}`,
  );
}

async function shutdown() {
  await Promise.all(
    processes.map(
      (child) =>
        new Promise((resolve) => {
          if (child.exitCode !== null || child.signalCode) {
            resolve();
            return;
          }
          child.once('exit', resolve);
          child.kill('SIGTERM');
          setTimeout(() => {
            if (child.exitCode === null && !child.signalCode) {
              child.kill('SIGKILL');
            }
          }, 1000).unref();
        }),
    ),
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    void shutdown();
  });
