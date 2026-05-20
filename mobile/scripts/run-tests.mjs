import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const TEST_ROOTS = ['services', 'src'];
const TSX_CLI = join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');

function findTestFiles(root) {
  const files = [];

  function walk(directory) {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (fullPath.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

const testFiles = TEST_ROOTS.flatMap(findTestFiles);
const result = spawnSync(process.execPath, [TSX_CLI, '--test', ...testFiles], {
  encoding: 'utf8',
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
