import { readFileSync } from 'node:fs';
import process from 'node:process';

const [, , metadataPath, platform, ...expectedExtensions] = process.argv;

if (!metadataPath || !platform || expectedExtensions.length === 0) {
  console.error(
    'Usage: node scripts/verify-eas-artifact-metadata.mjs <metadata.json> <platform> <extension...>',
  );
  process.exit(1);
}

let metadata;
try {
  metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
} catch (error) {
  console.error(`Could not read EAS artifact metadata at ${metadataPath}: ${error}`);
  process.exit(1);
}

const candidates = collectStrings(metadata);
const match = candidates.find((candidate) =>
  expectedExtensions.some((extension) => candidate.endsWith(extension)),
);

if (!match) {
  console.error(
    `${platform} EAS artifact must end with one of ${expectedExtensions.join(
      ', ',
    )}. Saw: ${candidates.join(', ') || 'no artifact paths or URLs'}`,
  );
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    platform,
    artifact: match,
  }),
);

function collectStrings(value) {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStrings(item));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap((item) => collectStrings(item));
  }

  return [];
}
