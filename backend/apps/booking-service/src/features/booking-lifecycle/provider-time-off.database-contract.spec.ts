import { readFileSync } from 'fs';
import { join } from 'path';

describe('provider time-off booking database contract', () => {
  it('updates the quote-aware create booking RPC overload used by the service', () => {
    const migration = readFileSync(
      join(
        __dirname,
        '../../../../../database/20260520_add_provider_time_off_windows.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('p_accepted_quote_id uuid default null');
    expect(migration).toContain('p_quote_fairness_status text default null');
    expect(migration).toContain('p_quote_confidence text default null');
    expect(migration).toContain('accepted_quote_id uuid');
    expect(migration).toContain('quote_fairness_status text');
    expect(migration).toContain('quote_confidence text');
    expect(migration).toContain('from booking.provider_time_off_windows t');
    expect(migration).toContain("raise exception 'provider_unavailable'");
  });
});
