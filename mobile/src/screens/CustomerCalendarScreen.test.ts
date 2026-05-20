import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('customer calendar screen mirrors provider calendar for customer bookings', () => {
  const screenSource = readFileSync(
    join(process.cwd(), 'src/screens/CustomerCalendarScreen.tsx'),
    'utf8',
  );
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/customer-calendar/views/CustomerCalendar.tsx'),
    'utf8',
  );
  const viewModelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-calendar/viewModels/useCustomerCalendarViewModel.ts',
    ),
    'utf8',
  );

  assert.match(screenSource, /features\/customer-calendar\/views\/CustomerCalendar/);
  assert.match(appSource, /label: 'Calendar'/);
  assert.match(appSource, /route\.screen === 'calendar' \? renderCustomerCalendar\(\)/);
  assert.match(viewSource, /title="Calendar"/);
  assert.match(viewSource, /Your upcoming service schedule/);
  assert.match(viewSource, /MonthCalendar/);
  assert.match(viewSource, /openBooking\(booking\)/);
  assert.match(viewModelSource, /activeBookingStatuses/);
  assert.match(viewModelSource, /pending/);
  assert.match(viewModelSource, /confirmed/);
  assert.match(viewModelSource, /in_progress/);
  assert.match(viewModelSource, /formatApiDate/);
});
