import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const required = [
  'API_GATEWAY_CORS_ORIGINS',
  'AUTH_SERVICE_URL',
  'USER_SERVICE_URL',
  'CATALOG_SERVICE_URL',
  'BOOKING_SERVICE_URL',
  'AVAILABILITY_SERVICE_URL',
  'MESSAGING_SERVICE_URL',
  'PAYMENT_SERVICE_URL',
  'REVIEW_SERVICE_URL',
  'NOTIFICATION_SERVICE_URL',
  'SUPPORT_SERVICE_URL',
  'ADMIN_SERVICE_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'APICENTER_URL',
  'APICENTER_TRIBE_ID',
  'APICENTER_TRIBE_SECRET',
  'APICENTER_WEBHOOK_SECRET',
  'OPENROUTESERVICE_API_KEY',
];

const urlKeys = [
  'AUTH_SERVICE_URL',
  'USER_SERVICE_URL',
  'CATALOG_SERVICE_URL',
  'BOOKING_SERVICE_URL',
  'AVAILABILITY_SERVICE_URL',
  'MESSAGING_SERVICE_URL',
  'PAYMENT_SERVICE_URL',
  'REVIEW_SERVICE_URL',
  'NOTIFICATION_SERVICE_URL',
  'SUPPORT_SERVICE_URL',
  'ADMIN_SERVICE_URL',
  'SUPABASE_URL',
  'APICENTER_URL',
];

const env = {
  ...loadEnv(resolve(process.cwd(), '.env')),
  ...loadEnv(resolve(process.cwd(), '.env.production')),
  ...process.env,
};

const failures = [];
for (const key of required) {
  if (!env[key]?.trim()) {
    failures.push(`${key} is required`);
  }
}

for (const key of urlKeys) {
  const value = env[key]?.trim();
  if (value && !isHttpUrl(value)) {
    failures.push(`${key} must be an http(s) URL`);
  }
}

const publicOrigins = splitCsv(env.API_GATEWAY_CORS_ORIGINS);
if (publicOrigins.length === 0) {
  failures.push('API_GATEWAY_CORS_ORIGINS must include deployed web origins');
}

if (env.ADMIN_REPORT_DELIVERY_WORKER_ENABLED === 'true') {
  if (!env.ADMIN_REPORT_DOWNLOAD_BASE_URL?.trim()) {
    failures.push(
      'ADMIN_REPORT_DOWNLOAD_BASE_URL is required when ADMIN_REPORT_DELIVERY_WORKER_ENABLED=true',
    );
  } else if (!isHttpUrl(env.ADMIN_REPORT_DOWNLOAD_BASE_URL)) {
    failures.push('ADMIN_REPORT_DOWNLOAD_BASE_URL must be an http(s) URL');
  }
}

if (env.ALLOW_LOCALHOST_PRODUCTION !== 'true') {
  for (const key of [
    ...urlKeys,
    'API_GATEWAY_CORS_ORIGINS',
    'ADMIN_REPORT_DOWNLOAD_BASE_URL',
  ]) {
    const value = env[key];
    if (value?.includes('localhost')) {
      failures.push(
        `${key} contains localhost; set ALLOW_LOCALHOST_PRODUCTION=true only for a local dry run`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(
    `Production backend env check failed:\n- ${failures.join('\n- ')}`,
  );
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    checked: required.length,
    corsOrigins: publicOrigins.length,
    localhostAllowed: env.ALLOW_LOCALHOST_PRODUCTION === 'true',
  }),
);

function loadEnv(path) {
  if (!existsSync(path)) return {};
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        return acc;
      }
      const [key, ...valueParts] = trimmed.split('=');
      acc[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      return acc;
    }, {});
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function splitCsv(value) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
