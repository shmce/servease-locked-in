#!/usr/bin/env node
/**
 * Compare backend/database/*.sql against migrations already applied to the
 * remote Supabase project, and fail when a SQL file in the repo has no
 * matching applied migration (the failure mode that broke production
 * messaging — a committed migration that was never run).
 *
 * Usage:
 *   SUPABASE_URL=...            \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *     node backend/scripts/check-migration-drift.mjs
 *
 * Exit codes:
 *   0  — every repo migration has a matching applied migration name
 *   1  — drift detected; list of missing migrations printed to stderr
 *   2  — could not connect to Supabase or list migrations
 *
 * Naming convention:
 *   Repo files:    backend/database/YYYYMMDD_<name>.sql
 *   Supabase migs: version YYYYMMDDHHMMSS, name <name>
 *
 * Matching is by <name> only — Supabase's migration timestamp is set when
 * the migration is applied, not when the SQL file was committed.
 *
 * Set MIGRATION_DRIFT_LOG_UNKNOWN=1 to also list applied migrations that
 * are not in the repo (informational only — never fails the check).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '../.env' });
config({ path: '.env', override: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoMigrationsDir = path.resolve(__dirname, '..', 'database');

const REPO_FILE_PATTERN = /^(\d{8})_(.+)\.sql$/;

function stripDatePrefix(filename) {
  const match = REPO_FILE_PATTERN.exec(filename);
  return match ? match[2] : null;
}

async function loadRepoMigrationNames() {
  const entries = await fs.readdir(repoMigrationsDir);
  const names = new Set();
  for (const entry of entries) {
    const name = stripDatePrefix(entry);
    if (name) {
      names.add(name);
    }
  }
  return names;
}

async function loadAppliedMigrationNames() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.',
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.rpc('servease_list_applied_migrations');

  if (error) {
    throw new Error(
      `Failed to call servease_list_applied_migrations: ${error.message}`,
    );
  }

  return new Set((data ?? []).map((row) => row.name));
}

async function main() {
  let repo;
  try {
    repo = await loadRepoMigrationNames();
  } catch (error) {
    console.error(`Failed to read repo migrations: ${error.message}`);
    process.exit(2);
  }

  let applied;
  try {
    applied = await loadAppliedMigrationNames();
  } catch (error) {
    console.error(`Failed to list applied migrations: ${error.message}`);
    process.exit(2);
  }

  const missing = [];
  for (const name of repo) {
    if (!applied.has(name)) {
      missing.push(name);
    }
  }

  const unknown = [];
  for (const name of applied) {
    if (!repo.has(name)) {
      unknown.push(name);
    }
  }

  if (missing.length === 0) {
    console.log(
      `OK — ${repo.size} repo migrations are all applied (${applied.size} applied total, ${unknown.length} applied but not in repo).`,
    );
    if (unknown.length > 0 && process.env.MIGRATION_DRIFT_LOG_UNKNOWN === '1') {
      console.log('\nApplied migrations not in repo (informational only):');
      for (const name of unknown.sort()) {
        console.log(`  - ${name}`);
      }
    }
    process.exit(0);
  }

  console.error(
    `FAIL — ${missing.length} repo migration${missing.length === 1 ? '' : 's'} are NOT applied to Supabase:`,
  );
  for (const name of missing.sort()) {
    console.error(`  - ${name}`);
  }
  console.error(
    '\nApply each missing migration via mcp__supabase__apply_migration or the Supabase CLI before merging.',
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
