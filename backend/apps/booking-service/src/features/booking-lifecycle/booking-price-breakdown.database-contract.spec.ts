import { readFileSync } from 'fs';
import { join } from 'path';

describe('booking price breakdown database contract', () => {
  const migration = readFileSync(
    join(
      __dirname,
      '../../../../../database/20260604_simplify_booking_price_breakdown.sql',
    ),
    'utf8',
  );

  it('adds structured price breakdown storage', () => {
    expect(migration).toContain(
      'add column if not exists price_breakdown jsonb null',
    );
    expect(migration).toContain('bookings_price_breakdown_object');
    expect(migration).toContain("jsonb_typeof(price_breakdown) = 'object'");
  });

  it('extends booking creation to preserve service subtotal and stored total separately', () => {
    expect(migration).toContain('p_total_amount numeric default null');
    expect(migration).toContain('p_price_breakdown jsonb default null');
    expect(migration).toContain(
      'v_service_amount numeric := coalesce(p_service_amount, 0)',
    );
    expect(migration).toContain(
      'v_total numeric := coalesce(p_total_amount, p_service_amount, 0)',
    );
    expect(migration).toContain('greatest(v_total - v_service_amount, 0)');
    expect(migration).toContain('p_price_breakdown,');
  });

  it('returns breakdown metadata from create, read, and transition RPCs', () => {
    expect(migration).toContain('price_breakdown jsonb');
    expect(migration).toContain('b.price_breakdown');
    expect(migration).toContain('servease_list_visible_bookings');
    expect(migration).toContain('servease_get_visible_booking');
    expect(migration).toContain('servease_transition_booking_status');
  });
});
