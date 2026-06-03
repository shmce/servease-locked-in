import type { AppRole, AppScreen, RouteState } from './types';

const authScreens = new Set<AppScreen>(['authGate']);
const customerTabScreens = new Set<AppScreen>([
  'explore',
  'bookings',
  'calendar',
  'messages',
  'more',
]);
const providerTabScreens = new Set<AppScreen>([
  'home',
  'bookings',
  'calendar',
  'messages',
  'more',
]);

type ExpoCompatibilityRoute = {
  sourcePath: string;
  target: RouteState;
  notes: string;
};

export const expoRouteCompatibilityRoutes: ExpoCompatibilityRoute[] = [
  {
    sourcePath: '/(auth)',
    target: { role: null, screen: 'authGate' },
    notes: 'Auth group routes enter the legacy shell auth gate.',
  },
  {
    sourcePath: '/(customer)/explore',
    target: { role: 'customer', screen: 'explore' },
    notes: 'Customer tab route opens the matching legacy customer tab.',
  },
  {
    sourcePath: '/(customer)/bookings',
    target: { role: 'customer', screen: 'bookings' },
    notes: 'Customer tab route opens the matching legacy customer tab.',
  },
  {
    sourcePath: '/(customer)/calendar',
    target: { role: 'customer', screen: 'calendar' },
    notes: 'Customer tab route opens the matching legacy customer tab.',
  },
  {
    sourcePath: '/(customer)/messages',
    target: { role: 'customer', screen: 'messages' },
    notes: 'Customer tab route opens the matching legacy customer tab.',
  },
  {
    sourcePath: '/(customer)/more',
    target: { role: 'customer', screen: 'more' },
    notes: 'Customer tab route opens the matching legacy customer tab.',
  },
  {
    sourcePath: '/(provider)/home',
    target: { role: 'provider', screen: 'home' },
    notes: 'Provider tab route opens the matching legacy provider tab.',
  },
  {
    sourcePath: '/(provider)/bookings',
    target: { role: 'provider', screen: 'bookings' },
    notes: 'Provider tab route opens the matching legacy provider tab.',
  },
  {
    sourcePath: '/(provider)/calendar',
    target: { role: 'provider', screen: 'calendar' },
    notes: 'Provider tab route opens the matching legacy provider tab.',
  },
  {
    sourcePath: '/(provider)/messages',
    target: { role: 'provider', screen: 'messages' },
    notes: 'Provider tab route opens the matching legacy provider tab.',
  },
  {
    sourcePath: '/(provider)/more',
    target: { role: 'provider', screen: 'more' },
    notes: 'Provider tab route opens the matching legacy provider tab.',
  },
];

export function legacyShellHref(target: RouteState): string {
  const params = new URLSearchParams();
  params.set('legacyScreen', target.screen);
  if (target.role) {
    params.set('legacyRole', target.role);
  }

  return `/?${params.toString()}`;
}

export function resolveLegacyShellRoute(
  roleParam: string | string[] | undefined,
  screenParam: string | string[] | undefined,
): RouteState | null {
  const screen = readSingleParam(screenParam);
  if (!screen) {
    return null;
  }

  if (authScreens.has(screen as AppScreen)) {
    return { role: null, screen: screen as AppScreen };
  }

  const role = readSingleParam(roleParam);
  if (!isAppRole(role)) {
    return null;
  }

  if (role === 'customer' && customerTabScreens.has(screen as AppScreen)) {
    return { role, screen: screen as AppScreen };
  }

  if (role === 'provider' && providerTabScreens.has(screen as AppScreen)) {
    return { role, screen: screen as AppScreen };
  }

  return null;
}

function readSingleParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function isAppRole(value: string | null): value is AppRole {
  return value === 'customer' || value === 'provider';
}
