import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { isPricingQuoteFresh } from '../../../shared/utils/booking';
import type { PricingQuoteSummary } from '../../../shared/models/types';

const freshQuote: PricingQuoteSummary = {
  quoteId: 'quote-1',
  customerId: 'customer-1',
  providerId: 'provider-1',
  serviceId: 'service-1',
  serviceAddress: '123 Test St',
  scheduledAt: '2026-06-03T08:00:00.000Z',
  hoursRequired: 2,
  pricingMode: 'flat',
  expiresAt: '2026-06-03T08:10:00.000Z',
  currency: 'PHP',
  estimatedTotal: 1200,
  fairRangeMin: 1000,
  fairRangeMax: 1400,
  fairnessStatus: 'within_range',
  confidence: 'high',
  lineItems: [],
  signals: {
    distanceKm: null,
    durationMinutes: null,
    fuelPricePerLiter: 68,
    fuelIndexUpdatedAt: '2026-06-01T00:00:00.000Z',
    staleFuelIndex: false,
    fallbackUsed: false,
  },
  explanation: 'Within typical rates.',
};

test('pricing quote freshness requires matching booking context when provided', () => {
  const now = new Date('2026-06-03T08:00:00.000Z').getTime();

  assert.equal(
    isPricingQuoteFresh(freshQuote, now, {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: ' 123   Test St ',
      scheduledAt: '2026-06-03T08:00:00.000Z',
      hoursRequired: 2,
      pricingMode: 'flat',
    }),
    true,
  );

  assert.equal(
    isPricingQuoteFresh(freshQuote, now, {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '456 Other St',
      scheduledAt: '2026-06-03T08:00:00.000Z',
      hoursRequired: 2,
      pricingMode: 'flat',
    }),
    false,
  );
});

test('contextless pricing quotes are stale when booking context must be checked', () => {
  const contextlessQuote: PricingQuoteSummary = {
    quoteId: freshQuote.quoteId,
    customerId: freshQuote.customerId,
    providerId: freshQuote.providerId,
    serviceId: freshQuote.serviceId,
    expiresAt: freshQuote.expiresAt,
    currency: freshQuote.currency,
    estimatedTotal: freshQuote.estimatedTotal,
    fairRangeMin: freshQuote.fairRangeMin,
    fairRangeMax: freshQuote.fairRangeMax,
    fairnessStatus: freshQuote.fairnessStatus,
    confidence: freshQuote.confidence,
    lineItems: freshQuote.lineItems,
    signals: freshQuote.signals,
    explanation: freshQuote.explanation,
  };

  assert.equal(
    isPricingQuoteFresh(contextlessQuote, Date.now(), {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-06-03T08:00:00.000Z',
      hoursRequired: 2,
      pricingMode: 'flat',
    }),
    false,
  );
});

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
  assert.match(actionSource, /latitude: serviceLocation\.confirmedPin\.latitude/);
  assert.match(actionSource, /longitude: serviceLocation\.confirmedPin\.longitude/);
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
