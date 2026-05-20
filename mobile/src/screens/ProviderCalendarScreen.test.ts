import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('provider calendar screen renders month grid markers and opens date detail', () => {
  const screenSource = readFileSync(
    join(process.cwd(), 'src/screens/ProviderCalendarScreen.tsx'),
    'utf8',
  );
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/provider-calendar/views/ProviderCalendar.tsx'),
    'utf8',
  );
  const viewModelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-calendar/viewModels/useProviderCalendarViewModel.ts',
    ),
    'utf8',
  );

  assert.match(screenSource, /features\/provider-calendar\/views\/ProviderCalendar/);
  assert.match(viewModelSource, /getProviderAvailability/);
  assert.match(viewModelSource, /timeOffWindows/);
  assert.match(viewModelSource, /daysOff/);
  assert.match(viewModelSource, /activeBookingsByDate/);
  assert.match(viewSource, /onSelectDate/);
  assert.match(viewSource, /MonthCalendar/);
  assert.match(viewSource, /markers=\{calendar\.data\.calendarMarkers\}/);
  assert.match(viewModelSource, /full/);
  assert.match(viewModelSource, /partial/);
  assert.match(viewModelSource, /booking/);
});
