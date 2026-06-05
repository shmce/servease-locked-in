import assert from 'node:assert/strict';
import test from 'node:test';
import {
  expoRouteCompatibilityRoutes,
  legacyShellHref,
  resolveLegacyShellRoute,
} from './expoRouteCompatibility';

test('Expo tab route compatibility inventory maps visible tabs to legacy shell routes', () => {
  assert.deepEqual(
    expoRouteCompatibilityRoutes.map((route) => route.sourcePath),
    [
      '/(auth)',
      '/(customer)/explore',
      '/(customer)/bookings',
      '/(customer)/calendar',
      '/(customer)/messages',
      '/(customer)/more',
      '/(provider)/home',
      '/(provider)/bookings',
      '/(provider)/calendar',
      '/(provider)/messages',
      '/(provider)/more',
    ],
  );
});

test('legacy shell href carries the target role and screen', () => {
  assert.equal(
    legacyShellHref({ role: 'customer', screen: 'bookings' }),
    '/?legacyScreen=bookings&legacyRole=customer',
  );
  assert.equal(
    legacyShellHref({ role: null, screen: 'authGate' }),
    '/?legacyScreen=authGate',
  );
});

test('legacy shell route parser only accepts supported direct tab routes', () => {
  assert.deepEqual(resolveLegacyShellRoute('customer', 'calendar'), {
    role: 'customer',
    screen: 'calendar',
  });
  assert.deepEqual(resolveLegacyShellRoute('provider', 'home'), {
    role: 'provider',
    screen: 'home',
  });
  assert.deepEqual(resolveLegacyShellRoute(undefined, 'authGate'), {
    role: null,
    screen: 'authGate',
  });
  assert.equal(resolveLegacyShellRoute('customer', 'providerPortfolio'), null);
  assert.equal(resolveLegacyShellRoute('admin', 'bookings'), null);
});
