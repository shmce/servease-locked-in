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

describe('review ranking database contract', () => {
  it('keeps provider rating summaries in sync with visible reviews', () => {
    const migrations = readDatabaseMigrations();

    expect(migrations).toContain(
      'create or replace function public.servease_refresh_provider_review_stats',
    );
    expect(migrations).toContain('update provider_catalog.provider_profiles pp');
    expect(migrations).toContain('coalesce(r.is_flagged, false) = false');
    expect(migrations).toContain('perform public.servease_refresh_provider_review_stats(p_provider_id);');
    expect(migrations).toContain(
      'perform public.servease_refresh_provider_review_stats(v_previous_provider_id);',
    );
    expect(migrations).toContain('perform public.servease_refresh_provider_review_stats(v_provider_id);');
  });
});
