import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = readFileSync(join(process.cwd(), 'src/navigation/routeHelpers.ts'), 'utf8');

function functionSource(name: string): string {
  const start = source.indexOf(`export function ${name}`);
  assert.notEqual(start, -1);
  const nextExport = source.indexOf('export function ', start + 1);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

test('customer tab helper keeps customer detail routes role-pure', () => {
  const customerTabSource = functionSource('getCustomerTab');

  assert.match(customerTabSource, /screen === 'customerBookingDetail'/);
  assert.match(customerTabSource, /screen === 'customerTrackServiceProvider'/);
  assert.match(customerTabSource, /screen === 'customerProfile'/);
  assert.doesNotMatch(customerTabSource, /providerProfileView/);
  assert.doesNotMatch(customerTabSource, /providerSetAvailability/);
  assert.doesNotMatch(customerTabSource, /providerReviews/);
});

test('provider tab helper classifies provider detail routes', () => {
  const providerTabSource = functionSource('getProviderTab');

  assert.match(providerTabSource, /screen === 'providerBookingDetail'/);
  assert.match(providerTabSource, /screen === 'providerNavigationMode'/);
  assert.match(providerTabSource, /screen === 'providerSetAvailability'/);
  assert.match(providerTabSource, /screen === 'providerReviews'/);
});
