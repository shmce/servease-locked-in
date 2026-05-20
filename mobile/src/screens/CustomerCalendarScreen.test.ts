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
  const appRouterSource = readFileSync(
    join(process.cwd(), 'src/legacy-router/AppRouter.tsx'),
    'utf8',
  );
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
  assert.match(appSource, /calendar: renderCustomerCalendar/);
  assert.match(appRouterSource, /label: 'Calendar'/);
  assert.match(appRouterSource, /renderers\.customer\.calendar\(\)/);
  assert.match(viewSource, /title="Calendar"/);
  assert.match(viewSource, /Your upcoming service schedule/);
  assert.match(viewSource, /MonthCalendar/);
  assert.match(viewSource, /openBooking\(booking\)/);
  assert.match(viewSource, /View all/);
  assert.match(viewSource, /onViewAllBookings/);
  assert.match(viewModelSource, /activeBookingStatuses/);
  assert.match(viewModelSource, /pending/);
  assert.match(viewModelSource, /confirmed/);
  assert.match(viewModelSource, /in_progress/);
  assert.match(viewModelSource, /formatApiDate/);
  assert.match(viewModelSource, /upcomingPreviewLimit = 3/);
  assert.match(viewModelSource, /Next up/);
});
