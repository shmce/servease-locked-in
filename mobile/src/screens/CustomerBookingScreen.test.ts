import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('customer booking flow renders blocked slots as unavailable and refreshes after server backstop', () => {
  const source = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const bookingFormView = readFileSync(
    join(process.cwd(), 'src/features/customer-booking/views/CustomerBookingForm.tsx'),
    'utf8',
  );
  const scheduleView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingSchedulePicker.tsx',
    ),
    'utf8',
  );
  const scheduleViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingViewModel.ts',
    ),
    'utf8',
  );
  const bookingDomain = readFileSync(
    join(process.cwd(), 'src/domain/booking.ts'),
    'utf8',
  );

  assert.match(bookingFormView, /CustomerBookingSchedulePicker/);
  assert.match(scheduleViewModel, /buildCustomerBookingAvailability/);
  assert.match(scheduleView, /MonthCalendar/);
  assert.match(scheduleViewModel, /calendarDisabledDates/);
  assert.match(scheduleViewModel, /calendarMarkers/);
  assert.match(scheduleView, /markers=\{data\.calendarMarkers\}/);
  assert.match(scheduleView, /minDate=\{data\.customerCalendarMinDate\}/);
  assert.match(scheduleView, /Provider unavailable/);
  assert.match(scheduleView, /disabled=\{!isAvailable\}/);
  assert.match(source, /providerUnavailableSlotPickerMessage\(error, message\)/);
  assert.match(
    bookingDomain,
    /This slot was just taken or blocked\. Please pick another\./,
  );
  assert.match(bookingDomain, /provider_unavailable/);
  assert.match(source, /refreshSelectedProviderAvailability\(selectedProvider\.providerId\)/);
  const backstopBranchStart = source.indexOf(
    'providerUnavailableSlotPickerMessage(error, message)',
  );
  const backstopBranchEnd = source.indexOf('} else {', backstopBranchStart);
  const backstopBranch = source.slice(backstopBranchStart, backstopBranchEnd);
  assert.match(backstopBranch, /navigate\('customerBookingForm', 'customer'\)/);
});
