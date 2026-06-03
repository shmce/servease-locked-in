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
  assert.match(viewSource, /ProviderScreen/);
  assert.match(viewSource, /ProviderHeader/);
  assert.match(viewSource, /ProviderStatusPill/);
  assert.match(viewSource, /Search bookings/);
  assert.match(viewSource, /Today's Agenda/);
  assert.match(viewSource, /DashboardActionCard/);
  assert.match(viewSource, /DashboardActionFrame/);
  assert.match(viewSource, /dashboardAccent/);
  assert.match(viewSource, /dashboardAccentEdge/);
  assert.match(viewSource, /dashboardContent/);
  assert.match(viewSource, /dashboardDivider/);
  assert.match(viewSource, /eyebrowIcon/);
  assert.match(viewSource, /detailIcon/);
  assert.match(viewSource, /PerformanceMetricCard/);
  assert.match(viewSource, /ratingMetricCard/);
  assert.match(viewSource, /flexBasis: '47%'/);
  assert.match(viewSource, /flexBasis: '100%'/);
  assert.match(viewSource, /AgendaEmptyState/);
  assert.match(viewSource, /No appointments today/);
  assert.match(viewSource, /model\.greetingName/);
  assert.match(viewSource, /adjustsFontSizeToFit/);
  assert.match(viewSource, /minimumFontScale=\{0\.72\}/);
  assert.match(viewSource, /flexWrap: 'wrap'/);
  assert.match(viewSource, /minWidth/);
  assert.match(viewSource, /overflow: 'hidden'/);
  assert.match(viewSource, /width: spacing\.base/);
  assert.match(viewSource, /paddingLeft: spacing\.xl/);
  assert.match(viewSource, /height: StyleSheet\.hairlineWidth/);
  assert.match(viewSource, /fontSize: 28/);
  assert.match(viewSource, /minHeight: 44/);
  assert.match(viewSource, /accessibilityLabel=\{status\.accessibilityLabel\}/);
  assert.match(viewSource, /accessibilityLabel="Search provider bookings and requests"/);
  assert.match(viewSource, /accessibilityLabel="View all provider bookings"/);
  assert.match(viewSource, /accessibilityLabel="Open provider earnings"/);
  assert.match(modelSource, /All caught up/);
  assert.doesNotMatch(viewSource, /Provider tools/);
  assert.doesNotMatch(viewSource, /ActionHero/);
  assert.doesNotMatch(viewSource, /NextAgendaRow/);
  assert.doesNotMatch(viewSource, /PendingRequestsRow/);
  assert.doesNotMatch(viewSource, /ProviderMetricCard/);
  assert.doesNotMatch(viewSource, /Request Payout/);
  assert.doesNotMatch(viewSource, /Block time off/);
  assert.doesNotMatch(viewSource, /Block Time/);
  assert.doesNotMatch(viewSource, /Available Payout/);
  assert.doesNotMatch(viewSource, /My Services/);
  assert.doesNotMatch(viewSource, /Quick Actions/);
  assert.doesNotMatch(viewSource, /palette\.(coral|blue|violet|amber)/);
});

test('provider home redesign preserves provider routes and scope', () => {
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/provider-home/views/ProviderHome.tsx'),
    'utf8',
  );
  const providerNavigationSource = readFileSync(
    join(
      process.cwd(),
      'src/features/provider-navigation-mode/views/ProviderNavigationMode.tsx',
    ),
    'utf8',
  );

  assert.match(viewSource, /navigate\('providerNotifications', 'provider'\)/);
  assert.match(viewSource, /navigate\('bookings', 'provider'\)/);
  assert.match(viewSource, /navigate\('providerEarnings', 'provider'\)/);
  assert.match(viewSource, /openBooking\(item\.booking, 'providerBookingDetail'\)/);
  assert.match(viewSource, /onOpen\(hero, hero\.primaryActionScreen\)/);
  assert.match(viewSource, /onOpen\(hero, hero\.secondaryActionScreen\)/);
  assert.match(appSource, /function renderProviderHome\(\)[\s\S]*<ProviderHomeScreen/);
  assert.match(appSource, /home: renderProviderHome/);
  assert.doesNotMatch(viewSource, /features\/customer/);
  assert.doesNotMatch(providerNavigationSource, /DashboardActionCard/);
  assert.doesNotMatch(providerNavigationSource, /ProviderStatusPill/);
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
  assert.equal(emptyHero.primaryActionLabel, 'Block time');
});

test('provider home dashboard model exposes job, request, and caught-up display rows', async () => {
  const { buildProviderHomeViewModel } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );
  const now = new Date('2026-05-20T11:00:00+08:00');

  const jobModel = buildProviderHomeViewModel({
    bookings: [
      booking({ scheduledAt: '2026-05-20T11:20:00+08:00' }),
      booking({
        id: 'booking-2',
        customerFullName: 'Casey Reyes',
        serviceTitle: 'Minor Repair Visit',
        scheduledAt: '2026-05-20T15:00:00+08:00',
      }),
    ],
    payments: [payment({ providerPayout: 1240, paidAt: '2026-05-20T09:00:00+08:00' })],
    payoutTotal: 1200,
    minimumPayoutAmount: 1,
    now,
  });

  assert.equal(jobModel.dashboardStatus.label, 'Available');
  if (jobModel.hero.kind !== 'job') {
    assert.fail('Expected the dashboard hero to be a job');
  }
  assert.equal(jobModel.hero.eyebrow, 'Next job');
  assert.equal(jobModel.hero.timeLabel, '11:20 AM');
  assert.equal(jobModel.hero.customerLabel, 'Maria');
  assert.equal(jobModel.hero.statusLabel, 'Confirmed');
  assert.equal(jobModel.activeBookings[0].serviceLabel, 'Minor Repair Visit');
  assert.equal(jobModel.activeBookings[0].customerLabel, 'Casey');
  assert.equal(jobModel.todayEarningsLabel, 'PHP 1,240');

  const requestModel = buildProviderHomeViewModel({
    bookings: [booking({ status: 'pending' }), booking({ id: 'booking-2', status: 'pending' })],
    payments: [],
    payoutTotal: 0,
    minimumPayoutAmount: 1,
    now,
  });

  if (requestModel.hero.kind !== 'requests') {
    assert.fail('Expected the dashboard hero to be pending requests');
  }
  assert.equal(requestModel.hero.eyebrow, 'Booking requests');
  assert.equal(requestModel.hero.countLabel, '2 requests');
  assert.equal(requestModel.hero.primaryActionScreen, 'bookings');

  const caughtUpModel = buildProviderHomeViewModel({
    bookings: [],
    payments: [],
    payoutTotal: 0,
    minimumPayoutAmount: 1,
    now,
  });

  if (caughtUpModel.hero.kind !== 'caught-up') {
    assert.fail('Expected the dashboard hero to be caught up');
  }
  assert.equal(caughtUpModel.hero.eyebrow, 'Schedule open');
  assert.equal(caughtUpModel.hero.primaryActionScreen, 'calendar');
  assert.equal(caughtUpModel.hero.secondaryActionScreen, 'providerProfileView');
  assert.equal(caughtUpModel.hero.primaryActionLabel, 'Block time');
});

test('provider home dashboard status reflects active in-progress work', async () => {
  const { buildProviderHomeViewModel } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );

  const model = buildProviderHomeViewModel({
    bookings: [booking({ status: 'in_progress' })],
    payments: [],
    payoutTotal: 1200,
    minimumPayoutAmount: 1,
    now: new Date('2026-05-20T11:00:00+08:00'),
  });

  assert.equal(model.dashboardStatus.label, 'On a job');
  assert.equal(model.dashboardStatus.helperLabel, 'Active service in progress');
  if (model.hero.kind !== 'job') {
    assert.fail('Expected in-progress work to use a job hero');
  }
  assert.equal(model.hero.statusLabel, 'In progress');
  assert.equal(model.hero.primaryActionLabel, 'Continue');
});

test('provider home performance cards use full readable labels', async () => {
  const { buildProviderHomePerformanceCards } = await import(
    '../features/provider-home/viewModels/providerHomeModel'
  );

  assert.deepEqual(
    buildProviderHomePerformanceCards({
      todayEarnings: 1240,
      weekEarnings: 8760,
      ratingLabel: '5.0',
    }),
    [
      {
        id: 'today',
        label: 'Today',
        value: 'PHP 1,240',
        meta: "Today's payout",
        accessibilityLabel: "Today's earnings PHP 1,240",
      },
      {
        id: 'week',
        label: 'This week',
        value: 'PHP 8,760',
        meta: 'Paid this week',
        accessibilityLabel: "This week's earnings PHP 8,760",
      },
      {
        id: 'rating',
        label: 'Rating',
        value: '5.0',
        meta: 'Customer score',
        accessibilityLabel: 'Provider rating 5.0',
      },
    ],
  );
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
        eyebrow: 'Schedule open',
        title: 'All caught up.',
        subtitle: 'No jobs need action right now.',
        meta: 'Open schedule',
        primaryActionLabel: 'Block time',
        secondaryActionLabel: 'Share profile',
        primaryActionScreen: 'calendar',
        secondaryActionScreen: 'providerProfileView',
      },
      dashboardStatus: {
        label: 'Available',
        helperLabel: 'Ready for bookings',
        accessibilityLabel: 'Provider status: available',
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
      todayEarningsLabel: 'PHP 0',
      weekEarningsLabel: 'PHP 0',
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
        eyebrow: 'Next job',
        title: 'Deep Cleaning',
        subtitle: '2:00 PM · Maria',
        meta: '123 Mabini Street, Manila',
        timeLabel: '2:00 PM',
        customerLabel: 'Maria',
        statusLabel: 'Confirmed',
        bookingId: 'booking-1',
        primaryActionLabel: 'Navigate',
        primaryActionScreen: 'providerNavigationMode',
      },
      dashboardStatus: {
        label: 'Available',
        helperLabel: 'Ready for bookings',
        accessibilityLabel: 'Provider status: available',
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
      todayEarningsLabel: 'PHP 0',
      weekEarningsLabel: 'PHP 900',
    },
  );
});
