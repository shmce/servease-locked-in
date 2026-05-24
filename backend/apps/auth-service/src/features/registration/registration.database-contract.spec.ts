import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function readDatabaseMigrations(): string {
  const databaseDir = join(__dirname, '../../../../../database');
  if (!existsSync(databaseDir)) return '';

  return readdirSync(databaseDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => readFileSync(join(databaseDir, file), 'utf8'))
    .join('\n');
}

describe('registration database contract', () => {
  it('persists birthdate through the internal registration RPC', () => {
    const migrations = readDatabaseMigrations();

    expect(migrations).toContain('add column if not exists birthdate date');
    expect(migrations).toContain('p_birthdate text');
    expect(migrations).toContain('invalid_provider_birthdate');
    expect(migrations).toContain(
      'servease_register_internal_user(uuid, text, text, text, text, text)',
    );
  });
});
