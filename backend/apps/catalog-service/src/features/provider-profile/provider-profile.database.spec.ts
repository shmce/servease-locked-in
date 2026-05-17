import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

describe('provider profile database contracts', () => {
  it('defines the provider profile update RPC with all editable profile fields', () => {
    const databaseDir = join(process.cwd(), 'database');
    const combinedSql = readdirSync(databaseDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()
      .map((file) => readFileSync(join(databaseDir, file), 'utf8'))
      .join('\n');

    expect(combinedSql).toContain(
      `create or replace function public.servease_update_provider_profile(
  p_user_id uuid,
  p_business_name text,
  p_bio text,
  p_service_description text,
  p_service_area text,
  p_years_experience integer
)`,
    );
    expect(combinedSql).toContain('bio text,');
    expect(combinedSql).toContain('service_description text,');
    expect(combinedSql).toContain('service_area text,');
    expect(combinedSql).toContain('years_experience integer,');
    expect(combinedSql).toContain(
      'revoke all on function public.servease_update_provider_profile(uuid, text, text, text, text, integer)',
    );
    expect(combinedSql).toContain(
      'grant execute on function public.servease_update_provider_profile(uuid, text, text, text, text, integer)',
    );
  });
});
