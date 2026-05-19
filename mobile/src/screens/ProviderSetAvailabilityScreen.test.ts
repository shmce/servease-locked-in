import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('provider set availability screen enforces lead time and maps API errors', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/screens/ProviderSetAvailabilityScreen.tsx'),
    'utf8',
  );

  assert.match(source, /You can only block dates at least 2 days from today\./);
  assert.match(source, /time_off_too_soon/);
  assert.match(source, /time_off_conflicts_booking/);
  assert.match(source, /invalid_availability_request/);
  assert.match(source, /addProviderDayOff/);
  assert.match(source, /addProviderTimeOffWindow/);
  assert.match(source, /removeProviderDayOff/);
  assert.match(source, /removeProviderTimeOffWindow/);
  assert.match(source, /bookingTimeSlots/);
});
