import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'ADMIN_SMOKE_EMAIL',
  'ADMIN_SMOKE_PASSWORD',
];

const env = {
  ...loadEnv(resolve(root, '.env')),
  ...loadEnv(resolve(root, '.env.local')),
  ...loadEnv(resolve(root, '.env.production')),
  ...process.env,
};

const failures = [];
for (const key of required) {
  if (!env[key]?.trim()) {
    failures.push(`${key} is required`);
  }
}

for (const key of ['NEXT_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']) {
  const value = env[key]?.trim();
  if (value && !isHttpsUrl(value)) {
    failures.push(`${key} must be an https URL for production`);
  }
}

if (env.NEXT_PUBLIC_API_BASE_URL?.includes('localhost')) {
  failures.push('NEXT_PUBLIC_API_BASE_URL must not point to localhost in production');
}

if (failures.length > 0) {
  console.error(`Admin production env check failed:\n- ${failures.join('\n- ')}`);
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
