import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const required = [
  'SERVEASE_API_BASE_URL',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

const env = {
  ...loadEnv(resolve(process.cwd(), '.env')),
  ...loadEnv(resolve(process.cwd(), '.env.local')),
  ...loadEnv(resolve(process.cwd(), '.env.production')),
  ...process.env,
};

const failures = [];
for (const key of required) {
  if (!env[key]?.trim()) {
    failures.push(`${key} is required`);
  }
}

for (const key of required.filter((item) => item.endsWith('_URL'))) {
  const value = env[key]?.trim();
  if (value && !isHttpsUrl(value)) {
    failures.push(`${key} must be an https URL for production`);
  }
}

if (normalizeUrl(env.SERVEASE_API_BASE_URL) !== normalizeUrl(env.NEXT_PUBLIC_API_BASE_URL)) {
  failures.push('SERVEASE_API_BASE_URL and NEXT_PUBLIC_API_BASE_URL must point to the same deployed gateway');
}

if (failures.length > 0) {
  console.error(`Landing production env check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checked: required.length }));

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

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeUrl(value) {
  return value?.trim().replace(/\/$/, '') ?? '';
}
