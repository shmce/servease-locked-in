import { readFileSync } from 'fs';
import { join } from 'path';

describe('booking scheduling guardrails database contract', () => {
  const migration = readFileSync(
    join(
      __dirname,
      '../../../../../database/20260603_harden_booking_scheduling_guardrails.sql',
    ),
    'utf8',
  );

  it('rejects past booking creation in the booking RPC backstop', () => {
    expect(migration).toContain('p_scheduled_at is null or p_scheduled_at < now()');
    expect(migration).toContain("raise exception 'booking_schedule_in_past'");
    expect(migration).toContain("raise exception 'provider_unavailable'");
    expect(migration).toContain('from booking.provider_days_off d');
    expect(migration).toContain('from booking.provider_time_off_windows t');
    expect(migration).toContain('from booking.provider_availability_windows w');
    expect(migration).toContain('from booking.bookings b');
    expect(migration).toContain("b.status in ('pending', 'confirmed', 'in_progress')");
  });

  it('persists pricing quote context needed to validate accepted quotes', () => {
    expect(migration).toContain('add column if not exists service_address text null');
    expect(migration).toContain('add column if not exists scheduled_at timestamptz null');
    expect(migration).toContain('add column if not exists hours_required numeric null');
    expect(migration).toContain('add column if not exists pricing_mode text null');
    expect(migration).toContain('p_service_address text default null');
    expect(migration).toContain('p_scheduled_at timestamptz default null');
    expect(migration).toContain('p_hours_required numeric default null');
    expect(migration).toContain('p_pricing_mode text default');
  });
});
