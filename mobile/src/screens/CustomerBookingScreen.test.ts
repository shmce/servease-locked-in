import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('customer booking flow renders blocked slots as unavailable and refreshes after server backstop', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
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
  assert.match(
    bookingFlowViewModel,
    /providerUnavailableSlotPickerMessage\(error, message\)/,
  );
  assert.match(
    bookingDomain,
    /This slot was just taken or blocked\. Please pick another\./,
  );
  assert.match(bookingDomain, /provider_unavailable/);
  assert.match(bookingFlowViewModel, /onRefreshProviderAvailability\(selectedProvider\.providerId\)/);
  const backstopBranchStart = bookingFlowViewModel.indexOf(
    'providerUnavailableSlotPickerMessage(error, message)',
  );
  const backstopBranchEnd = bookingFlowViewModel.indexOf('} else {', backstopBranchStart);
  const backstopBranch = bookingFlowViewModel.slice(backstopBranchStart, backstopBranchEnd);
  assert.match(backstopBranch, /screen: 'customerBookingForm'/);
});

test('customer booking form constrains the sticky footer estimate row', () => {
  const bookingFormView = readFileSync(
    join(process.cwd(), 'src/features/customer-booking/views/CustomerBookingForm.tsx'),
    'utf8',
  );

  assert.match(bookingFormView, /style=\{styles\.footerTotalCopy\}/);
  assert.match(bookingFormView, /numberOfLines=\{2\}/);
  assert.match(bookingFormView, /adjustsFontSizeToFit/);
  assert.match(bookingFormView, /minimumFontScale=\{0\.78\}/);
  assert.match(bookingFormView, /maxWidth: '48%'/);
});
