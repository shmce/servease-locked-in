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

describe('admin user database contract', () => {
  it('defines the RPCs required by the admin user service', () => {
    const migrations = readDatabaseMigrations();

    expect(migrations).toContain(
      'function public.servease_admin_users_summary',
    );
    expect(migrations).toContain(
      'function public.servease_admin_list_users',
    );
    expect(migrations).toContain(
      'function public.servease_admin_update_user_status',
    );
  });
});
