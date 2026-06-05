import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

test('customer map picker search keeps results pending for confirmation', () => {
  const source = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const actionStart = source.indexOf('async function searchServiceLocationPin');
  const nextActionStart = source.indexOf(
    'async function useCurrentServiceLocation',
    actionStart,
  );
  assert.ok(actionStart > -1);
  assert.ok(nextActionStart > actionStart);

  const actionSource = source.slice(actionStart, nextActionStart);

  assert.match(source, /const \[mapSearchQuery, setMapSearchQuery\]/);
  assert.match(source, /const \[mapSearchError, setMapSearchError\]/);
  assert.match(source, /mapSearchBusy/);
  assert.match(actionSource, /const trimmed = mapSearchQuery\.trim\(\)/);
  assert.match(
    actionSource,
    /if \(!trimmed\) \{[\s\S]*setMapSearchError\('Enter an address or place to search\.'\)/,
  );
  assert.match(
    actionSource,
    /const result = await geocodeAddress\(trimmed,[\s\S]*language: 'en'[\s\S]*region: 'PH'/,
  );
  assert.match(
    actionSource,
    /startCustomerBookingPendingPin\([\s\S]*result,[\s\S]*'search'/,
  );
  assert.match(actionSource, /setLastResolvedPin\(/);
  assert.match(actionSource, /setMapPickerVisible\(true\)/);
  assert.match(actionSource, /setMapSearchError\(message\)/);
  assert.doesNotMatch(actionSource, /confirmCustomerBookingPin/);
});

test('customer map picker inspection preserves confirmed saved pins', () => {
  const source = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const actionStart = source.indexOf('async function openServiceLocationPicker');
  const nextActionStart = source.indexOf(
    'function closeServiceLocationPicker',
    actionStart,
  );
  assert.ok(actionStart > -1);
  assert.ok(nextActionStart > actionStart);

  const actionSource = source.slice(actionStart, nextActionStart);

  assert.match(actionSource, /const existingPendingPin = serviceLocation\.pendingPin/);
  assert.match(
    actionSource,
    /const existingConfirmedPin = serviceLocation\.confirmedPin/,
  );
  assert.match(
    actionSource,
    /const existingPin = existingPendingPin \?\? existingConfirmedPin \?\? null/,
  );
  assert.match(actionSource, /if \(existingPendingPin\) \{/);
  assert.match(actionSource, /setMapPickerVisible\(true\)/);
  assert.doesNotMatch(actionSource, /pendingPin: existingPin/);
});

test('customer booking saves Home from confirmed coordinates and reuses the saved result', () => {
  const source = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const actionStart = source.indexOf('async function saveCurrentAddressAsHome');
  const nextActionStart = source.indexOf(
    'async function openServiceLocationPicker',
    actionStart,
  );
  assert.ok(actionStart > -1);
  assert.ok(nextActionStart > actionStart);

  const actionSource = source.slice(actionStart, nextActionStart);

  assert.match(source, /updateCustomerAddress,/);
  assert.match(actionSource, /if \(!serviceLocation\.confirmedPin\)/);
  assert.match(actionSource, /Confirm the service pin before saving it as Home/);
  assert.match(actionSource, /resolveHomeAddressToSave/);
  assert.match(actionSource, /const confirmedPin = serviceLocation\.confirmedPin/);
  assert.match(actionSource, /latitude: confirmedPin\.latitude/);
  assert.match(actionSource, /longitude: confirmedPin\.longitude/);
  assert.match(actionSource, /await updateCustomerAddress\(homeAddress\.id/);
  assert.match(actionSource, /await createCustomerAddress\(addressPayload/);
  assert.match(actionSource, /applySavedAddress\(savedAddress\)/);
  assert.match(actionSource, /onCustomerAddressSaved\(savedAddress\)/);
});

test('customer current location replacement clears saved address selection', () => {
  const source = readFileSync(
    join(
      process.cwd(),
      'src/features/customer-booking/viewModels/useCustomerBookingFlowViewModel.ts',
    ),
    'utf8',
  );
  const actionStart = source.indexOf('async function useCurrentServiceLocation');
  const nextActionStart = source.indexOf(
    'async function saveCurrentAddressAsHome',
    actionStart,
  );
  assert.ok(actionStart > -1);
  assert.ok(nextActionStart > actionStart);

  const actionSource = source.slice(actionStart, nextActionStart);

  assert.match(
    actionSource,
    /startCustomerBookingPendingPin\([\s\S]*result,[\s\S]*'current'/,
  );
  assert.match(actionSource, /setSelectedSavedAddressId\(null\)/);
  assert.match(
    actionSource,
    /Current location found\. Confirm the service pin before review\./,
  );
});
