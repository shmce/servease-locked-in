import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('provider set availability screen enforces lead time and maps API errors', () => {
  const screenSource = readFileSync(
    join(process.cwd(), 'src/screens/ProviderSetAvailabilityScreen.tsx'),
    'utf8',
  );
  const viewSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-set-availability/views/ProviderSetAvailability.tsx',
    ),
    'utf8',
  );
  const viewModelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-set-availability/viewModels/useProviderSetAvailabilityViewModel.ts',
    ),
    'utf8',
  );

  assert.match(
    screenSource,
    /features\/provider-set-availability\/views\/ProviderSetAvailability/,
  );
  assert.match(viewSource, /useProviderSetAvailabilityViewModel/);
  assert.match(viewModelSource, /You can only block dates at least 2 days from today\./);
  assert.match(viewModelSource, /time_off_too_soon/);
  assert.match(viewModelSource, /time_off_conflicts_booking/);
  assert.match(viewModelSource, /invalid_availability_request/);
  assert.match(viewModelSource, /addProviderDayOff/);
  assert.match(viewModelSource, /addProviderTimeOffWindow/);
  assert.match(viewModelSource, /removeProviderDayOff/);
  assert.match(viewModelSource, /removeProviderTimeOffWindow/);
  assert.match(viewModelSource, /bookingTimeSlots/);
});

test('provider set availability uses modal time rows for specific-time blocks', () => {
  const viewSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-set-availability/views/ProviderSetAvailability.tsx',
    ),
    'utf8',
  );

  assert.match(viewSource, /TimeRow/);
  assert.match(viewSource, /TimePickerModal/);
  assert.match(viewSource, /activeTimePicker/);
  assert.match(viewSource, /data\.endOptions/);
  assert.match(viewSource, /Modal visible=\{visible\}/);
  assert.match(viewSource, /adjustsFontSizeToFit/);
  assert.doesNotMatch(viewSource, /slotGrid/);
  assert.doesNotMatch(viewSource, /SlotButton/);
});
