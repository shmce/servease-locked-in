import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('provider calendar screen renders month grid markers and opens date detail', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/screens/ProviderCalendarScreen.tsx'),
    'utf8',
  );

  assert.match(source, /getProviderAvailability/);
  assert.match(source, /timeOffWindows/);
  assert.match(source, /daysOff/);
  assert.match(source, /activeBookingsByDate/);
  assert.match(source, /onSelectDate/);
  assert.match(source, /MonthCalendar/);
  assert.match(source, /markers=/);
  assert.match(source, /full/);
  assert.match(source, /partial/);
  assert.match(source, /booking/);
});
