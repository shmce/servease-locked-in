import { spawn } from 'node:child_process';
import process from 'node:process';

const suites = [
  {
    name: 'backend',
    cwd: 'backend',
    envCommand: ['npm', ['run', 'env:prod']],
    commands: [
      ['npm', ['run', 'lint:check']],
      ['npm', ['test']],
      ['npm', ['run', 'build']],
      ['npm', ['run', 'smoke:health']],
      ['npm', ['audit', '--omit=dev']],
    ],
  },
  {
    name: 'mobile',
    cwd: 'mobile',
    envCommand: ['npm', ['run', 'env:prod']],
    commands: [
      ['npm', ['run', 'typecheck']],
      ['npm', ['run', 'lint']],
      ['npm', ['run', 'test:cov']],
      ['npm', ['audit', '--omit=dev']],
    ],
  },
  {
    name: 'landing',
    cwd: 'Landing Page',
    envCommand: ['npm', ['run', 'env:prod']],
    commands: [
      ['npm', ['run', 'typecheck']],
      ['npm', ['run', 'lint']],
      ['npm', ['test']],
      ['npm', ['run', 'build']],
      ['npx', ['playwright', 'test']],
      ['npm', ['audit', '--omit=dev']],
    ],
  },
  {
    name: 'admin',
    cwd: 'admin',
    envCommand: ['npm', ['run', 'env:prod']],
    commands: [
      ['npm', ['run', 'lint']],
      ['npm', ['run', 'typecheck']],
      ['npm', ['test']],
      ['npm', ['run', 'build']],
      ['npm', ['audit', '--omit=dev']],
    ],
  },
];

const selected = new Set(
  process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith('--')),
);
const listOnly = process.argv.includes('--list');
const includeEnv = process.argv.includes('--include-env');
const commandTimeoutMs = Number.parseInt(
  process.env.PREFLIGHT_COMMAND_TIMEOUT_MS ?? '900000',
  10,
);

async function main() {
  if (!Number.isFinite(commandTimeoutMs) || commandTimeoutMs <= 0) {
    throw new Error('PREFLIGHT_COMMAND_TIMEOUT_MS must be a positive integer');
  }

  const activeSuites = selected.size
    ? suites.filter((suite) => selected.has(suite.name))
    : suites;

  if (activeSuites.length === 0) {
    throw new Error(`No matching suites: ${[...selected].join(', ')}`);
  }

  for (const suite of activeSuites) {
    console.log(`\n# ${suite.name}`);
    const commands = includeEnv
      ? [suite.envCommand, ...suite.commands]
      : suite.commands;
    for (const [command, args] of commands) {
      const printable = `${command} ${args.join(' ')}`;
      if (listOnly) {
        console.log(`- (${suite.cwd}) ${printable}`);
        continue;
      }
      await run(command, args, suite.cwd);
    }
  }
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    let forceKillTimeout = null;
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      forceKillTimeout = setTimeout(() => {
        child.kill('SIGKILL');
      }, 5000);
    }, commandTimeoutMs);
    child.on('exit', (code, signal) => {
      clearTimeout(timeout);
      if (forceKillTimeout) {
        clearTimeout(forceKillTimeout);
      }
      if (timedOut) {
        reject(
          new Error(
            `${command} ${args.join(' ')} timed out in ${cwd} after ${commandTimeoutMs}ms`,
          ),
        );
        return;
      }
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} failed in ${cwd} with ${
            signal ? `signal ${signal}` : `exit code ${code}`
          }`,
        ),
      );
    });
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
