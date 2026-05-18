import { readFileSync } from 'node:fs';
import process from 'node:process';

const templates = [
  {
    file: 'backend/.env.production.example',
    required: [
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
    ],
  },
  {
    file: 'mobile/.env.production.example',
    required: [
      'EXPO_PUBLIC_API_BASE_URL',
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'EAS_PROJECT_ID',
    ],
  },
  {
    file: 'Landing Page/.env.production.example',
    required: [
      'SERVEASE_API_BASE_URL',
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ],
  },
  {
    file: 'admin/.env.production.example',
    required: [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'ADMIN_SMOKE_EMAIL',
      'ADMIN_SMOKE_PASSWORD',
    ],
  },
];

const checks = [];

for (const template of templates) {
  const env = parseEnv(template.file);
  for (const key of template.required) {
    checks.push({
      file: template.file,
      ok: Object.prototype.hasOwnProperty.call(env, key),
      message: `missing ${key}`,
    });
  }
  checks.push({
    file: template.file,
    ok: !Object.values(env).some((value) => value.includes('localhost')),
    message: 'template must not contain localhost values',
  });
}

const gitignore = readFileSync('.gitignore', 'utf8');
checks.push({
  file: '.gitignore',
  ok:
    gitignore.includes('!.env.production.example') &&
    gitignore.includes('!**/.env.production.example'),
  message: 'production env templates must be unignored',
});
checks.push({
  file: '.gitignore',
  ok: gitignore.includes('.codex/'),
  message: 'local .codex agent config should be ignored',
});

const failed = checks.filter((check) => !check.ok);
if (failed.length > 0) {
  console.error(
    failed
      .map((check) => `${check.file}: ${check.message}`)
      .join('\n'),
  );
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checked: checks.length }));

function parseEnv(file) {
  const entries = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }
    const [key, ...valueParts] = trimmed.split('=');
    entries[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
  }
  return entries;
}
