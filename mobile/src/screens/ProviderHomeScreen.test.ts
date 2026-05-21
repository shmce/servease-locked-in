import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { BookingSummary, PaymentSummary } from '../shared/models/types';

function booking(
  overrides: Partial<BookingSummary> = {},
): BookingSummary {
  return {
    id: overrides.id ?? 'booking-1',
    bookingReference: overrides.bookingReference ?? 'SRV-001',
    customerId: overrides.customerId ?? 'customer-1',
    customerFullName: overrides.customerFullName ?? 'Maria Santos',
    providerId: overrides.providerId ?? 'provider-1',
    providerBusinessName: overrides.providerBusinessName ?? 'ServEase Pro',
    serviceId: overrides.serviceId ?? 'service-1',
    serviceTitle: overrides.serviceTitle ?? 'Deep Cleaning',
    serviceAddress: overrides.serviceAddress ?? '123 Mabini Street, Manila',
    scheduledAt: overrides.scheduledAt ?? '2026-05-20T14:00:00+08:00',
    status: overrides.status ?? 'confirmed',
    totalAmount: overrides.totalAmount ?? 1200,
  };
}

function payment(overrides: Partial<PaymentSummary> = {}): PaymentSummary {
  return {
    id: overrides.id ?? 'payment-1',
    bookingId: overrides.bookingId ?? 'booking-1',
    customerId: overrides.customerId ?? 'customer-1',
    providerId: overrides.providerId ?? 'provider-1',
    amount: overrides.amount ?? 1000,
    platformFee: overrides.platformFee ?? 100,
    providerPayout: overrides.providerPayout ?? 900,
    status: overrides.status ?? 'paid',
    paymentMethod: overrides.paymentMethod ?? 'gcash',
    paidAt: overrides.paidAt ?? '2026-05-19T08:00:00+08:00',
    createdAt: overrides.createdAt ?? '2026-05-19T08:00:00+08:00',
  };
}

test('provider home is extracted from App into the action-first screen', () => {
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const screenPath = join(process.cwd(), 'src/screens/ProviderHomeScreen.tsx');

  assert.equal(existsSync(screenPath), true);

  const screenSource = readFileSync(screenPath, 'utf8');
  const modelSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-home/viewModels/providerHomeModel.ts',
    ),
    'utf8',
  );

  assert.match(
    appSource,
    /const ProviderHomeScreen = lazy\(\(\) =>[\s\S]*features\/provider-home\/views\/ProviderHome/,
  );
  assert.doesNotMatch(appSource, /from '\.\/screens\/ProviderHomeScreen'/);
  assert.match(appSource, /function renderProviderHome\(\)[\s\S]*<ProviderHomeScreen/);
  assert.match(screenSource, /features\/provider-home\/views\/ProviderHome/);
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/provider-home/views/ProviderHome.tsx'),
    'utf8',
  );
  assert.match(viewSource, /export function ProviderHomeScreen/);
  assert.match(viewSource, /providerHero/);
  assert.match(viewSource, /Search bookings, requests/);
  assert.match(viewSource, /Today's Agenda/);
  assert.match(viewSource, /NextAgendaRow/);
  assert.match(viewSource, /Next appointment/);
  assert.match(modelSource, /All caught up/);
  assert.doesNotMatch(viewSource, /Provider tools/);
  assert.doesNotMatch(viewSource, /ActionHero/);
  assert.doesNotMatch(viewSource, /Request Payout/);
  assert.doesNotMatch(viewSource, /Block Time/);
  assert.doesNotMatch(viewSource, /Available Payout/);
  assert.doesNotMatch(viewSource, /My Services/);
  assert.doesNotMatch(viewSource, /Quick Actions/);
  assert.doesNotMatch(viewSource, /palette\.(coral|blue|violet|amber)/);
});

test('provider home hero state matrix follows the action priority', async () => {
  const { buildProviderHomeViewModel } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );
  const now = new Date('2026-05-20T11:00:00+08:00');

  assert.equal(
    buildProviderHomeViewModel({
      bookings: [booking({ scheduledAt: '2026-05-20T14:00:00+08:00' })],
      payments: [],
      payoutTotal: 1200,
      minimumPayoutAmount: 1,
      now,
    }).hero.primaryActionLabel,
    'Navigate',
  );
  assert.equal(
    buildProviderHomeViewModel({
      bookings: [booking({ scheduledAt: '2026-05-20T11:20:00+08:00' })],
      payments: [],
      payoutTotal: 1200,
      minimumPayoutAmount: 1,
      now,
    }).hero.primaryActionLabel,
    'Start Service',
  );
  assert.equal(
    buildProviderHomeViewModel({
      bookings: [booking({ status: 'in_progress' })],
      payments: [],
      payoutTotal: 1200,
      minimumPayoutAmount: 1,
      now,
    }).hero.primaryActionLabel,
    'Continue',
  );
  assert.equal(
    buildProviderHomeViewModel({
      bookings: [booking({ status: 'pending' })],
      payments: [],
      payoutTotal: 1200,
      minimumPayoutAmount: 1,
      now,
    }).hero.primaryActionLabel,
    'Review requests',
  );
  const emptyHero = buildProviderHomeViewModel({
    bookings: [],
    payments: [],
    payoutTotal: 0,
    minimumPayoutAmount: 1,
    now,
  }).hero;
  assert.equal(emptyHero.kind, 'caught-up');
  assert.match(emptyHero.title, /All caught up/);
});

test('nextJobAction respects the exact 30 minute boundary', async () => {
  const { nextJobAction } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );
  const scheduled = booking({ scheduledAt: '2026-05-20T14:00:00+08:00' });

  assert.equal(
    nextJobAction(scheduled, new Date('2026-05-20T13:29:00+08:00')).label,
    'Navigate',
  );
  assert.equal(
    nextJobAction(scheduled, new Date('2026-05-20T13:30:00+08:00')).label,
    'Start Service',
  );
  assert.equal(
    nextJobAction(scheduled, new Date('2026-05-20T13:31:00+08:00')).label,
    'Start Service',
  );
});

test('request payout pill uses the existing positive-amount minimum', async () => {
  const { buildPayoutAction } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );

  assert.equal(buildPayoutAction(10, 1).disabled, false);
  assert.equal(buildPayoutAction(0, 1).disabled, true);
  assert.match(buildPayoutAction(0, 1).accessibilityLabel, /minimum PHP 1/);
});

test('provider home model snapshots cover empty and one-job states', async () => {
  const { buildProviderHomeViewModel } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );
  const now = new Date('2026-05-20T11:00:00+08:00');

  assert.deepEqual(
    buildProviderHomeViewModel({
      bookings: [],
      payments: [],
      payoutTotal: 0,
      minimumPayoutAmount: 1,
      now,
    }),
    {
      hero: {
        kind: 'caught-up',
        title: 'All caught up.',
        subtitle: 'No jobs or booking requests need action right now.',
        meta: 'Open schedule',
        primaryActionLabel: 'Block time off',
        secondaryActionLabel: 'Share profile',
        primaryActionScreen: 'calendar',
        secondaryActionScreen: 'providerProfileView',
      },
      payoutAction: {
        disabled: true,
        label: 'Request Payout',
        balanceLabel: 'PHP 0',
        helperLabel: 'Minimum PHP 1',
        accessibilityLabel:
          'Request Payout disabled. Available: PHP 0; minimum PHP 1 to request.',
      },
      activeBookings: [],
      todayEarnings: 0,
      weekEarnings: 0,
    },
  );

  assert.deepEqual(
    buildProviderHomeViewModel({
      bookings: [booking()],
      payments: [payment()],
      payoutTotal: 1200,
      minimumPayoutAmount: 1,
      now,
    }),
    {
      hero: {
        kind: 'job',
        title: 'Deep Cleaning',
        subtitle: '2:00 PM · Maria',
        meta: '123 Mabini Street, Manila',
        bookingId: 'booking-1',
        primaryActionLabel: 'Navigate',
        primaryActionScreen: 'providerNavigationMode',
      },
      payoutAction: {
        disabled: false,
        label: 'Request Payout',
        balanceLabel: 'PHP 1,200',
        helperLabel: 'PHP 1,200',
        accessibilityLabel: 'Request Payout. Available: PHP 1,200.',
      },
      activeBookings: [],
      todayEarnings: 0,
      weekEarnings: 900,
    },
  );
});
