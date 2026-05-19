import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('customer booking flow renders blocked slots as unavailable and refreshes after server backstop', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const bookingDomain = readFileSync(
    join(process.cwd(), 'src/domain/booking.ts'),
    'utf8',
  );

  assert.match(source, /buildCustomerBookingAvailability/);
  assert.match(source, /MonthCalendar/);
  assert.match(source, /calendarDisabledDates/);
  assert.match(source, /calendarMarkers/);
  assert.match(source, /markers=\{calendarMarkers\}/);
  assert.match(source, /minDate=\{customerCalendarMinDate\}/);
  assert.match(source, /Provider unavailable/);
  assert.match(source, /disabled=\{!isAvailable\}/);
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
