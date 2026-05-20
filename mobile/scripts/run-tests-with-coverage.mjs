import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const MINIMUM_COVERAGE_PERCENT = 80;
const TEST_ROOTS = ['services', 'src'];

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
const result = spawnSync(
  'tsx',
  ['--test', '--experimental-test-coverage', ...testFiles],
  {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  },
);
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.stdout) {
  process.stdout.write(result.stdout);
}
if (result.stderr) {
  process.stderr.write(result.stderr);
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const coverageMatch = output.match(
  /all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/,
);

if (!coverageMatch) {
  console.error('Could not find the all files row in the coverage report.');
  process.exit(1);
}

const [, lines, branches, functions] = coverageMatch.map(Number);
const failingMetrics = [
  ['lines', lines],
  ['branches', branches],
  ['functions', functions],
].filter(([, value]) => value < MINIMUM_COVERAGE_PERCENT);

if (failingMetrics.length) {
  console.error(
    failingMetrics
      .map(
        ([metric, value]) =>
          `Coverage ${metric} is ${value.toFixed(2)}%, below ${MINIMUM_COVERAGE_PERCENT}%.`,
      )
      .join('\n'),
  );
  process.exit(1);
}
