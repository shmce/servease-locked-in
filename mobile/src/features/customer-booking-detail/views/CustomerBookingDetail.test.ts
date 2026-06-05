import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('customer booking detail exposes overview/timeline tabs and collapsible pricing', () => {
  const screenSource = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking-detail/views/CustomerBookingDetail.tsx',
    ),
    'utf8',
  );
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

  assert.match(screenSource, /bookingDetailTabs\s*=\s*\[/);
  assert.match(screenSource, /activeTab,\s*setActiveTab/);
  assert.match(screenSource, /label: 'Overview'/);
  assert.match(screenSource, /label: 'Timeline'/);
  assert.match(screenSource, /isPriceBreakdownExpanded/);
  assert.match(screenSource, /No timeline updates yet/);
  assert.match(screenSource, /buildPinTimelineEvents/);
  assert.match(screenSource, /inferTimelineStatus\(/);
  assert.match(
    screenSource,
    /BookingTimelinePinRow[\s\S]*?entry\.resolvedLabel/,
  );
  assert.match(screenSource, /accessibilityLabel=\{`\$\{entry\.resolvedLabel\}, \$\{pinStateLabel\[entry\.state\]\} event, \$\{entry\.resolvedTime\}`\}/);
  assert.match(
    screenSource,
    /accessibilityState=\{\{\n\s*expanded: isPriceBreakdownExpanded,\n\s*disabled: !hasPriceBreakdownDetails,\n\s*\}\}/,
  );
  assert.match(appSource, /hasTimelineEvents=\{selectedBookingTimelineEvents.length > 0\}/);
  assert.match(appSource, /timelineEvents=\{selectedBookingTimelineEvents\}/);
});
