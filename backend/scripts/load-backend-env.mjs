import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export function loadBackendEnv(nodeEnv = process.env.NODE_ENV) {
  const mode = nodeEnv?.trim();
  const paths = [
    ...(mode ? [`.env.${mode}.local`] : []),
    ...(mode === 'test' ? [] : ['.env.local']),
    ...(mode ? [`.env.${mode}`] : []),
    '.env',
  ];

  for (const path of paths) {
    config({ path: resolve(backendRoot, path), override: false });
  }
}
