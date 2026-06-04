#!/usr/bin/env node

import { performance } from 'node:perf_hooks';

const DEFAULT_BASE_URL = 'http://localhost:5001';
const DEFAULT_ITERATIONS = 3;
const DEFAULT_TIMEOUT_MS = 8000;

const budgets = {
  serviceRead: {
    p50Ms: 250,
    p95Ms: 750,
  },
  gatewayRead: {
    p50Ms: 500,
    p95Ms: 1200,
  },
  composedGatewayRead: {
    p50Ms: 1000,
    p95Ms: 2000,
  },
};

const endpointSpecs = [
  {
    name: 'catalog.categories',
    method: 'GET',
    path: '/v1/catalog/categories',
    auth: 'public',
    budget: 'gatewayRead',
  },
  {
    name: 'catalog.services',
    method: 'GET',
    path: '/v1/catalog/services',
    auth: 'public',
    budget: 'gatewayRead',
  },
  {
    name: 'catalog.providers',
    method: 'GET',
    path: '/v1/catalog/providers',
    auth: 'public',
    budget: 'gatewayRead',
  },
  {
    name: 'customer.currentUser',
    method: 'GET',
    path: '/v1/me',
    auth: 'customer',
    tokenEnv: 'CUSTOMER_TOKEN',
    budget: 'composedGatewayRead',
  },
  {
    name: 'customer.addresses',
    method: 'GET',
    path: '/v1/me/addresses',
    auth: 'customer',
    tokenEnv: 'CUSTOMER_TOKEN',
    budget: 'gatewayRead',
  },
  {
    name: 'customer.bookings',
    method: 'GET',
    path: '/v1/bookings',
    auth: 'customer',
    tokenEnv: 'CUSTOMER_TOKEN',
    budget: 'composedGatewayRead',
  },
  {
    name: 'customer.notifications',
    method: 'GET',
    path: '/v1/notifications',
    auth: 'customer',
    tokenEnv: 'CUSTOMER_TOKEN',
    budget: 'gatewayRead',
  },
  {
    name: 'provider.profile',
    method: 'GET',
    path: '/v1/provider/profile',
    auth: 'provider',
    tokenEnv: 'PROVIDER_TOKEN',
    budget: 'composedGatewayRead',
  },
  {
    name: 'provider.dashboard',
    method: 'GET',
    path: '/v1/provider/dashboard',
    auth: 'provider',
    tokenEnv: 'PROVIDER_TOKEN',
    budget: 'composedGatewayRead',
  },
  {
    name: 'provider.bookings',
    method: 'GET',
    path: '/v1/bookings?scope=provider',
    auth: 'provider',
    tokenEnv: 'PROVIDER_TOKEN',
    budget: 'composedGatewayRead',
  },
  {
    name: 'provider.notifications',
    method: 'GET',
    path: '/v1/notifications',
    auth: 'provider',
    tokenEnv: 'PROVIDER_TOKEN',
    budget: 'gatewayRead',
  },
];

const baseUrl = trimTrailingSlash(
  process.env.GATEWAY_BASE_URL || process.env.API_BASE_URL || DEFAULT_BASE_URL,
);
const iterations = positiveInteger(
  process.env.MOBILE_TIMING_ITERATIONS,
  DEFAULT_ITERATIONS,
);
const timeoutMs = positiveInteger(
  process.env.MOBILE_TIMING_TIMEOUT_MS,
  DEFAULT_TIMEOUT_MS,
);

const startedAt = new Date().toISOString();
const results = [];

for (const spec of endpointSpecs) {
  const token = spec.tokenEnv ? process.env[spec.tokenEnv] : undefined;
  if (spec.tokenEnv && !token?.trim()) {
    results.push({
      name: spec.name,
      method: spec.method,
      path: spec.path,
      auth: spec.auth,
      budget: spec.budget,
      skipped: true,
      reason: `Missing ${spec.tokenEnv}`,
    });
    continue;
  }

  const samples = [];
  for (let index = 0; index < iterations; index += 1) {
    samples.push(await measureEndpoint(spec, token));
  }

  results.push(summarizeEndpoint(spec, samples));
}

const completedAt = new Date().toISOString();
const output = {
  event: 'mobile_read_path_timing',
  baseUrl,
  startedAt,
  completedAt,
  iterations,
  timeoutMs,
  budgets,
  results,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

async function measureEndpoint(spec, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${baseUrl}${spec.path}`;
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: spec.method,
      headers: {
        accept: 'application/json',
        ...(token?.trim() ? { authorization: `Bearer ${token.trim()}` } : {}),
      },
      signal: controller.signal,
    });
    const body = await response.text();
    const durationMs = round(performance.now() - started);
    return {
      ok: response.ok,
      status: response.status,
      durationMs,
      responseBytes: Buffer.byteLength(body),
    };
  } catch (error) {
    const durationMs = round(performance.now() - started);
    return {
      ok: false,
      status: 'network_error',
      durationMs,
      responseBytes: 0,
      error: error instanceof Error ? error.message : 'Request failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function summarizeEndpoint(spec, samples) {
  const durations = samples.map((sample) => sample.durationMs);
  const budget = budgets[spec.budget];
  const p50Ms = percentile(durations, 50);
  const p95Ms = percentile(durations, 95);
  const successCount = samples.filter((sample) => sample.ok).length;

  return {
    name: spec.name,
    method: spec.method,
    path: spec.path,
    auth: spec.auth,
    budget: spec.budget,
    sampleCount: samples.length,
    successCount,
    statusCodes: samples.map((sample) => sample.status),
    p50Ms,
    p95Ms,
    minMs: Math.min(...durations),
    maxMs: Math.max(...durations),
    averageMs: round(
      durations.reduce((sum, durationMs) => sum + durationMs, 0) /
        durations.length,
    ),
    responseBytes: {
      min: Math.min(...samples.map((sample) => sample.responseBytes)),
      max: Math.max(...samples.map((sample) => sample.responseBytes)),
    },
    withinBudget:
      successCount === samples.length &&
      p50Ms <= budget.p50Ms &&
      p95Ms <= budget.p95Ms,
    samples,
  };
}

function percentile(values, targetPercentile) {
  const sorted = [...values].sort((left, right) => left - right);
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.ceil((targetPercentile / 100) * sorted.length) - 1;
  return round(sorted[Math.min(sorted.length - 1, Math.max(0, index))]);
}

function positiveInteger(rawValue, fallback) {
  const parsed = Number(rawValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function trimTrailingSlash(value) {
  return value.replace(/\/$/, '');
}

function round(value) {
  return Math.round(value * 100) / 100;
}
