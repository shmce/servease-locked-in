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
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
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
  assert.match(
    bookingFlowViewModel,
    /onRefreshProviderAvailability\(selectedProvider\.providerId\)/,
  );
  const backstopBranchStart = bookingFlowViewModel.indexOf(
    'providerUnavailableSlotPickerMessage(error, message)',
  );
  const backstopBranchEnd = bookingFlowViewModel.indexOf(
    '} else {',
    backstopBranchStart,
  );
  const backstopBranch = bookingFlowViewModel.slice(
    backstopBranchStart,
    backstopBranchEnd,
  );
  assert.match(backstopBranch, /screen: 'customerBookingForm'/);
});

test('customer booking form constrains the sticky footer estimate row', () => {
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );

  assert.match(bookingFormView, /style=\{styles\.footerTotalCopy\}/);
  assert.match(bookingFormView, /numberOfLines=\{2\}/);
  assert.match(bookingFormView, /adjustsFontSizeToFit/);
  assert.match(bookingFormView, /minimumFontScale=\{0\.78\}/);
  assert.match(bookingFormView, /maxWidth: '48%'/);
});

test('customer booking address section keeps map, saved, current, and manual paths', () => {
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const bookingFormViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFormViewModel.ts',
    ),
    'utf8',
  );

  assert.match(bookingFormViewModel, /Choose on map/);
  assert.match(bookingFormView, /onOpenMapPicker/);
  assert.match(bookingFormView, /savedAddressOptions/);
  assert.match(bookingFormView, /Use current/);
  assert.match(bookingFormView, /Service Address/);
  assert.match(bookingFormView, /CustomerMapPinPickerModal/);
  assert.match(
    bookingFlowViewModel,
    /serviceLatitude: serviceLocation\.confirmedPin/,
  );
  assert.match(
    bookingFlowViewModel,
    /serviceLongitude: serviceLocation\.confirmedPin/,
  );
});

test('customer booking map picker flow supports search current manual reverse and confirm', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );

  assert.match(
    bookingFlowViewModel,
    /startCustomerBookingPendingPin[\s\S]*'search'/,
  );
  assert.match(
    bookingFlowViewModel,
    /startCustomerBookingPendingPin[\s\S]*'current'/,
  );
  assert.match(bookingFlowViewModel, /moveCustomerBookingPendingPin/);
  assert.match(bookingFlowViewModel, /reverseGeocodeServiceLocationPin/);
  assert.match(bookingFlowViewModel, /confirmCustomerBookingPin/);
  assert.match(bookingFlowViewModel, /searchServiceLocationPin/);
  assert.match(mapSource, /map\.on\('moveend', \(\) => postPin\(map\)\)/);
  assert.match(mapSource, /map\.on\('click', \(event\) =>/);
  assert.match(bookingFormView, /onManualDetailsChange/);
  assert.match(bookingFormView, /Confirm pin/);
});

test('customer booking map picker uses a full-screen map-first layout', () => {
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );

  assert.match(bookingFormView, /KeyboardAvoidingView/);
  assert.match(bookingFormView, /mapPickerTopOverlay/);
  assert.match(bookingFormView, /mapPickerSearchBar/);
  assert.match(bookingFormView, /mapPickerFloatingActions/);
  assert.match(bookingFormView, /mapPickerSheet[\s\S]*position: 'absolute'/);
  assert.match(mapSource, /servicePickerMapFrame[\s\S]*flex: 1/);
  assert.match(mapSource, /maplibregl-ctrl-bottom-right[\s\S]*bottom: 214px/);
  assert.match(mapSource, /servicePickerPinShadow/);
  assert.doesNotMatch(bookingFormView, /mapPickerHeader/);
  assert.doesNotMatch(bookingFormView, /nudgePin/);
  assert.doesNotMatch(bookingFormView, /nudgeButton/);
  assert.doesNotMatch(mapSource, /picker-hint/);
});

test('customer booking map picker searches inside the map without replacing current and refresh controls', () => {
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

  assert.match(bookingFormView, /mapSearchQuery/);
  assert.match(bookingFormView, /mapSearchError/);
  assert.match(bookingFormView, /onMapSearchQueryChange/);
  assert.match(bookingFormView, /onSearchMapPin/);
  assert.match(bookingFormView, /returnKeyType="search"/);
  assert.match(bookingFormView, /onSubmitEditing=\{onSearchMapPin\}/);
  assert.match(bookingFormView, /accessibilityLabel="Search map address"/);
  assert.match(bookingFormView, /mapPickerSearchSubmit/);
  assert.match(bookingFormView, /mapPickerFloatingActions/);
  assert.match(bookingFormView, /accessibilityLabel="Use current location"/);
  assert.match(bookingFormView, /accessibilityLabel=\{[\s\S]*'Retry pin address'/);
  assert.match(appSource, /mapSearchQuery=\{customerBookingFlow\.data\.mapSearchQuery\}/);
  assert.match(appSource, /onSearchMapPin=\{\(\) =>[\s\S]*searchServiceLocationPin\(\)/);
});

test('customer booking address actions wrap inside the booking form body', () => {
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );

  const addressSectionStart = bookingFormView.indexOf(
    'title="Where do you need it?"',
  );
  const addressSectionOpen = bookingFormView.slice(
    addressSectionStart,
    bookingFormView.indexOf('>', addressSectionStart) + 1,
  );

  assert.ok(addressSectionStart > -1);
  assert.doesNotMatch(addressSectionOpen, /action=\{/);
  assert.match(bookingFormView, /styles\.addressActionRow/);
  assert.match(bookingFormView, /styles\.addressMapAction/);
  assert.match(bookingFormView, /flexWrap: 'wrap'/);
  assert.match(bookingFormView, /minWidth: 160/);
  assert.match(bookingFormView, /numberOfLines=\{1\}/);
});

test('customer booking map picker auto-refreshes the pin address without stale updates', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const bookingFormViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFormViewModel.ts',
    ),
    'utf8',
  );
  const bookingFormView = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/views/CustomerBookingForm.tsx',
    ),
    'utf8',
  );

  assert.match(bookingFlowViewModel, /type PinAddressStatus =/);
  assert.match(
    bookingFlowViewModel,
    /const autoReverseGeocodeDebounceMs = 750/,
  );
  assert.match(
    bookingFlowViewModel,
    /const autoReverseGeocodeDistanceThresholdMeters = 20/,
  );
  assert.match(bookingFlowViewModel, /distanceBetweenCoordinatesMeters/);
  assert.match(bookingFlowViewModel, /reverseGeocodeRequestRef = useRef\(0\)/);
  assert.match(bookingFlowViewModel, /latestServiceLocationRef/);
  assert.match(
    bookingFlowViewModel,
    /setTimeout\(\(\) => \{\s*void resolveServiceLocationPinAddress\(pin, 'auto'\);/s,
  );
  assert.match(
    bookingFlowViewModel,
    /if \(requestId !== reverseGeocodeRequestRef\.current\) \{\s*return;/s,
  );
  assert.match(bookingFlowViewModel, /isActivePinCoordinate/);
  assert.match(bookingFlowViewModel, /pinAddressStatus/);
  assert.match(bookingFormViewModel, /Finding pin address/);
  assert.match(bookingFormView, /pinAddressStatus/);
  assert.match(bookingFormView, /Finding address\.\.\./);
  assert.match(bookingFormView, /Retry/);
});

test('customer booking pin confirmation cancels outstanding auto address lookup', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const confirmStart = bookingFlowViewModel.indexOf(
    'function confirmServiceLocationPin()',
  );
  const confirmEnd = bookingFlowViewModel.indexOf(
    'function validateServiceLocationForReview()',
    confirmStart,
  );
  const confirmSource = bookingFlowViewModel.slice(confirmStart, confirmEnd);
  const invalidationIndex = confirmSource.indexOf(
    'reverseGeocodeRequestRef.current += 1;',
  );
  const confirmationIndex = confirmSource.indexOf('confirmCustomerBookingPin');

  assert.ok(confirmStart > -1);
  assert.ok(confirmEnd > confirmStart);
  assert.ok(invalidationIndex > -1);
  assert.ok(invalidationIndex < confirmationIndex);
});

test('cash booking confirmation continues after refreshing a stale quote', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const submitStart = bookingFlowViewModel.indexOf(
    'async function submitBooking',
  );
  const submitEnd = bookingFlowViewModel.indexOf(
    'async function fetchPricingQuote',
    submitStart,
  );
  const submitSource = bookingFlowViewModel.slice(submitStart, submitEnd);
  const refreshIndex = submitSource.indexOf(
    'quote = await fetchPricingQuote();',
  );
  const cashGateIndex = submitSource.indexOf(
    'canSubmitBookingAfterPricingRefresh(paymentMethod)',
  );
  const staleReturnIndex = submitSource.indexOf('return null;', refreshIndex);

  assert.ok(submitStart > -1);
  assert.ok(submitEnd > submitStart);
  assert.match(bookingFlowViewModel, /canSubmitBookingAfterPricingRefresh,/);
  assert.match(
    submitSource,
    /const paymentMethod =\s*selectedCustomerPaymentMethod\?\.methodType \?\? 'cash_on_service';/,
  );
  assert.ok(refreshIndex > -1);
  assert.ok(cashGateIndex > refreshIndex);
  assert.ok(staleReturnIndex > cashGateIndex);
  assert.match(submitSource, /paymentMethod,/);
});

test('cash booking confirmation does not block on pricing quote failures', () => {
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const submitStart = bookingFlowViewModel.indexOf(
    'async function submitBooking',
  );
  const submitEnd = bookingFlowViewModel.indexOf(
    'async function fetchPricingQuote',
    submitStart,
  );
  const submitSource = bookingFlowViewModel.slice(submitStart, submitEnd);

  assert.ok(submitStart > -1);
  assert.ok(submitEnd > submitStart);
  assert.match(
    submitSource,
    /catch \(error\) \{\s*if \(!canSubmitBookingAfterPricingRefresh\(paymentMethod\)\) \{\s*throw error;\s*\}\s*quote = null;\s*setPricingQuote\(null\);/s,
  );
  assert.match(submitSource, /acceptedQuoteId:\s*null/);
});

test('cash booking confirmation stays on review when final schedule validation fails', () => {
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const bookingFlowViewModel = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const confirmStart = appSource.indexOf('async function confirmBookingWithPayment');
  const confirmEnd = appSource.indexOf('async function submitProviderPayoutRequest', confirmStart);
  const submitStart = bookingFlowViewModel.indexOf('async function submitBooking');
  const fetchPricingStart = bookingFlowViewModel.indexOf(
    'async function fetchPricingQuote',
    submitStart,
  );
  assert.ok(confirmStart > -1);
  assert.ok(confirmEnd > confirmStart);
  assert.ok(submitStart > -1);
  assert.ok(fetchPricingStart > submitStart);

  const confirmSource = appSource.slice(confirmStart, confirmEnd);
  const submitSource = bookingFlowViewModel.slice(submitStart, fetchPricingStart);

  assert.match(appSource, /bookingSlotError=\{customerBookingFlow\.data\.bookingSlotError\}/);
  assert.match(confirmSource, /navigateOnScheduleFailure: false/);
  assert.match(confirmSource, /void refreshPayments\(\)\.catch\(\(\) => undefined\)/);
  assert.doesNotMatch(confirmSource, /await refreshPayments\(\)\.catch/);
  assert.match(submitSource, /navigateOnScheduleFailure\?: boolean/);
  assert.match(
    submitSource,
    /if \(options\.navigateOnScheduleFailure \?\? true\) \{[\s\S]*screen: 'customerBookingForm'/,
  );
});

test('customer booking map picker keeps map tiles stable while recentering by bridge', () => {
  const mapSource = readFileSync(
    join(process.cwd(), 'src/tracking/TrackingMapPreview.tsx'),
    'utf8',
  );

  assert.match(mapSource, /const initialMapCenterRef = useRef\(mapCenter\)/);
  assert.match(
    mapSource,
    /const mapHtml = useMemo\(\(\) => buildServiceLocationPickerHtml\(initialMapCenterRef\.current\), \[\]\)/,
  );
  assert.match(mapSource, /webViewRef\.current\?\.injectJavaScript/);
  assert.match(mapSource, /window\.__serveasePickerMap/);
  assert.match(mapSource, /type: 'recenter'/);
  assert.match(mapSource, /window\.parent\?\.postMessage/);
  assert.match(mapSource, /iframeRef/);
  assert.doesNotMatch(
    mapSource,
    /buildServiceLocationPickerHtml\(mapCenter, address\)/,
  );
  assert.doesNotMatch(mapSource, /\[address, mapCenter\]/);
});
