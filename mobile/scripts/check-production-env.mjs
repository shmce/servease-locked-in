import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const required = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];
if (process.env.MOBILE_REQUIRE_EAS_PROJECT === 'true') {
  required.push('EAS_PROJECT_ID');
}

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

for (const key of ['EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_SUPABASE_URL']) {
  const value = env[key]?.trim();
  if (value && !isHttpsUrl(value)) {
    failures.push(`${key} must be an https URL for production`);
  }
}

if (env.EXPO_PUBLIC_API_BASE_URL?.includes('localhost')) {
  failures.push('EXPO_PUBLIC_API_BASE_URL must not point to localhost in production');
}

if (
  env.EAS_PROJECT_ID &&
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    env.EAS_PROJECT_ID,
  )
) {
  failures.push('EAS_PROJECT_ID must be a UUID from the Expo project settings');
}

if (failures.length > 0) {
  console.error(`Mobile production env check failed:\n- ${failures.join('\n- ')}`);
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
