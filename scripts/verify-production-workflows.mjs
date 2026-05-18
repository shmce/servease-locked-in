import { readFileSync } from 'node:fs';
import process from 'node:process';

const files = {
  readiness: '.github/workflows/production-readiness.yml',
  release: '.github/workflows/production-release.yml',
  eas: 'mobile/eas.json',
};

const checks = [
  ...containsAll(files.readiness, [
    'name: Production readiness',
    'backend:',
    'mobile:',
    'landing:',
    'admin:',
    'npm run smoke:health',
    'npx playwright test',
    'npm run smoke:routes',
    'node scripts/verify-production-env-templates.mjs',
  ]),
  ...containsAll(files.release, [
    'name: Production release verification',
    'workflow_dispatch:',
    'run_live_apicenter_audit:',
    'live_audit_send:',
    'live_audit_payment:',
    'live_audit_openrouteservice:',
    'live_audit_phone:',
    'live_audit_email:',
    'quality-gates:',
    'env-and-live-gates:',
    'native-builds:',
    'needs: quality-gates',
    'needs: env-and-live-gates',
    'node scripts/production-preflight.mjs',
    'node scripts/verify-production-env-templates.mjs',
    'npm run check:migrations',
    'npm run smoke:apicenter',
    'npm run audit:apicenter-live',
    'Validate EAS token',
    'EAS_TOKEN production secret is required for native builds',
    'timeout-minutes: 360',
    'npx eas-cli build --platform ios --profile production --non-interactive --wait',
    'npx eas-cli build --platform android --profile production --non-interactive --wait',
  ]),
  {
    file: files.release,
    ok: !read(files.release).includes('--no-wait'),
    message: 'production release workflow must not use --no-wait for EAS builds',
  },
  {
    file: files.eas,
    ok: JSON.parse(read(files.eas)).build?.production?.environment === 'production',
    message: 'EAS production build profile must use the production environment',
  },
  {
    file: files.eas,
    ok: JSON.parse(read(files.eas)).build?.preview?.environment === 'preview',
    message: 'EAS preview build profile must use the preview environment',
  },
];

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

function containsAll(file, expected) {
  const contents = read(file);
  return expected.map((text) => ({
    file,
    ok: contents.includes(text),
    message: `expected to contain ${JSON.stringify(text)}`,
  }));
}

function read(file) {
  return readFileSync(file, 'utf8');
}
