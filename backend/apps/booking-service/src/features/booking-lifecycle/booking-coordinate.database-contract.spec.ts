import { readFileSync } from 'fs';
import { join } from 'path';

describe('booking coordinate database contract', () => {
  const migration = readFileSync(
    join(
      __dirname,
      '../../../../../database/20260604_add_customer_map_pin_address_picker.sql',
    ),
    'utf8',
  );

  it('adds nullable service coordinate columns with range constraints', () => {
    expect(migration).toContain('add column if not exists service_latitude numeric(10, 8) null');
    expect(migration).toContain('add column if not exists service_longitude numeric(11, 8) null');
    expect(migration).toContain('bookings_service_latitude_range');
    expect(migration).toContain('service_latitude between -90 and 90');
    expect(migration).toContain('bookings_service_longitude_range');
    expect(migration).toContain('service_longitude between -180 and 180');
  });

  it('extends create and read RPCs to persist and return service coordinates', () => {
    expect(migration).toContain('p_service_latitude numeric default null');
    expect(migration).toContain('p_service_longitude numeric default null');
    expect(migration).toContain('service_latitude numeric');
    expect(migration).toContain('service_longitude numeric');
    expect(migration).toContain('p_service_latitude,');
    expect(migration).toContain('p_service_longitude,');
    expect(migration).toContain('b.service_latitude');
    expect(migration).toContain('b.service_longitude');
    expect(migration).toContain('grant execute on function public.servease_create_booking');
  });
});
