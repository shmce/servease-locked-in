import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function readDatabaseMigrations(): string {
  const databaseDir = join(process.cwd(), 'database');

  return readdirSync(databaseDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => readFileSync(join(databaseDir, file), 'utf8'))
    .join('\n');
}

describe('provider availability default database contracts', () => {
  it('seeds default availability when providers become approved and active', () => {
    const combinedSql = readDatabaseMigrations();

    expect(combinedSql).toContain(
      'create or replace function public.servease_ensure_default_provider_availability_windows',
    );
    expect(combinedSql).toContain(
      "if p_decision = 'approved' then\n    perform public.servease_ensure_default_provider_availability_windows(p_provider_id);",
    );
    expect(combinedSql).toContain(
      "if p_status = 'approved' then\n    perform public.servease_ensure_default_provider_availability_windows(p_provider_id);",
    );
    expect(combinedSql).toContain(
      "where coalesce(pp.verification_status, 'pending') = 'approved'\n      and coalesce(pp.is_active, true) = true",
    );
    expect(combinedSql).toContain(
      "(p_provider_id, 'saturday', '09:00'::time, '13:00'::time, true, 6)",
    );
  });
});
