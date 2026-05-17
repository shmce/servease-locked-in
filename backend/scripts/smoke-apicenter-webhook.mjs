#!/usr/bin/env node
/**
 * Local mock APICenter payment webhook smoke test.
 *
 * Seeds an APICenter checkout reconciliation row directly through the
 * payment-owned service-role RPC, starts payment-service and api-gateway, then
 * posts a fake APICenter webhook to the public gateway route. This does not
 * contact APICenter or create a real checkout.
 */

import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:apicenter-webhook`);
  }
}

const webhookSecret =
  process.env.APICENTER_WEBHOOK_SECRET?.trim() ||
  `servease-webhook-smoke-${randomUUID()}`;
const gatewayPort = Number(process.env.APICENTER_WEBHOOK_SMOKE_GATEWAY_PORT ?? 5501);
const paymentPort = Number(process.env.APICENTER_WEBHOOK_SMOKE_PAYMENT_PORT ?? 8607);
const gatewayUrl = `http://localhost:${gatewayPort}`;
const checkoutId = `servease-smoke-${randomUUID()}`;
const bookingId = randomUUID();
const customerId = randomUUID();
const providerId = randomUUID();
const processes = [];
let paymentId = null;

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
  const seeded = await rpc('servease_record_apicenter_checkout', {
    p_booking_id: bookingId,
    p_customer_id: customerId,
    p_provider_id: providerId,
    p_amount: 1200,
    p_payment_method: 'apicenter_checkout',
    p_checkout_id: checkoutId,
    p_provider: 'paymongo',
    p_provider_mode: 'test',
    p_checkout_status: 'created',
    p_reference_id: bookingId,
    p_redirect_url: 'https://pay.test/checkout',
    p_expires_at: null,
    p_amount_value: 120000,
    p_amount_currency: 'PHP',
    p_currency: 'PHP',
    p_payment_methods_allowed: ['gcash'],
    p_metadata: { bookingId },
  });
  const seededRow = Array.isArray(seeded) ? seeded[0] : seeded;
  if (!seededRow?.payment_id) {
    throw new Error('Failed to seed APICenter checkout reconciliation row');
  }
  paymentId = seededRow.payment_id;

  await startService('payment-service', paymentPort, {
    PAYMENT_SERVICE_PORT: String(paymentPort),
  });
  await startService('api-gateway', gatewayPort, {
    PORT: String(gatewayPort),
    PAYMENT_SERVICE_URL: `http://localhost:${paymentPort}`,
    APICENTER_WEBHOOK_SECRET: webhookSecret,
  });

  await expectWebhookError(
    {
      secret: 'wrong-secret',
      timestamp: String(Date.now()),
      status: 'paid',
    },
    401,
    'invalid_auth_token',
  );
  await expectWebhookError(
    {
      secret: webhookSecret,
      timestamp: String(Date.now() - 10 * 60 * 1000),
      status: 'paid',
    },
    400,
    'invalid_payment_request',
  );

  const reconciled = await postWebhook({
    secret: webhookSecret,
    timestamp: String(Date.now()),
    status: 'paid',
  });

  if (
    reconciled.checkoutId !== checkoutId ||
    reconciled.bookingId !== bookingId ||
    reconciled.localPaymentStatus !== 'paid'
  ) {
    throw new Error(
      `Webhook reconciliation returned unexpected payload: ${JSON.stringify(reconciled)}`,
    );
  }

  console.log(
    JSON.stringify({
      ok: true,
      route: '/v1/payments/webhooks/apicenter',
      checkoutId,
      paymentId,
      localPaymentStatus: reconciled.localPaymentStatus,
      invalidSecretRejected: true,
      staleTimestampRejected: true,
    }),
  );
}

async function postWebhook({ secret, timestamp, status }) {
  const response = await fetch(`${gatewayUrl}/v1/payments/webhooks/apicenter`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-apicenter-webhook-secret': secret,
      'x-apicenter-webhook-timestamp': timestamp,
    },
    body: JSON.stringify({
      checkoutId,
      provider: 'paymongo',
      providerMode: 'test',
      status,
      referenceId: bookingId,
      redirectUrl: 'https://pay.test/checkout',
      amount: { value: 120000, currency: 'PHP' },
      currency: 'PHP',
      paymentMethodsAllowed: ['gcash'],
      metadata: { bookingId },
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      `Webhook smoke failed with ${response.status}: ${JSON.stringify(body)}`,
    );
  }
  return body.data;
}

async function expectWebhookError(input, expectedStatus, expectedCode) {
  const response = await fetch(`${gatewayUrl}/v1/payments/webhooks/apicenter`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-apicenter-webhook-secret': input.secret,
      'x-apicenter-webhook-timestamp': input.timestamp,
    },
    body: JSON.stringify({
      checkoutId,
      provider: 'paymongo',
      providerMode: 'test',
      status: input.status,
      referenceId: bookingId,
      redirectUrl: 'https://pay.test/checkout',
    }),
  });
  const body = await response.json();
  const code = body?.error?.code;
  if (response.status !== expectedStatus || code !== expectedCode) {
    throw new Error(
      `Expected webhook error ${expectedStatus}/${expectedCode}, got ${response.status}/${code}`,
    );
  }
}

async function rpc(name, args) {
  const { data, error } = await serviceClient.rpc(name, args);
  if (error) {
    throw new Error(`${name} failed: ${error.message}`);
  }
  return data;
}

async function startService(appName, port, env = {}) {
  const child = spawn('node', [
    '-r',
    'ts-node/register/transpile-only',
    '-r',
    'tsconfig-paths/register',
    `apps/${appName}/src/main.ts`,
  ], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...env,
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
    `${appName} did not become healthy on port ${port}: ${
      lastError?.message ?? 'timeout'
    }\n${getLogs()}`,
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

  if (paymentId) {
    await serviceClient.rpc('servease_smoke_cleanup_extended', {
      p_user_id: null,
      p_payment_id: paymentId,
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
