import { AppScreen } from '../navigation/types';
import { formatMoney } from '../domain/booking';
import { BookingSummary, PaymentSummary } from '../../services/serveaseApi';

const MANILA_TIME_ZONE = 'Asia/Manila';
const START_SERVICE_WINDOW_MS = 30 * 60 * 1000;
const ACTIVE_BOOKING_STATUSES = new Set(['confirmed', 'in_progress']);

export type ProviderHomeHero =
  | {
      kind: 'job';
      title: string;
      subtitle: string;
      meta: string;
      bookingId: string;
      primaryActionLabel: string;
      primaryActionScreen: AppScreen;
    }
  | {
      kind: 'requests';
      title: string;
      subtitle: string;
      meta: string;
      pendingCount: number;
      primaryActionLabel: 'Review requests';
      primaryActionScreen: AppScreen;
    }
  | {
      kind: 'caught-up';
      title: 'All caught up.';
      subtitle: string;
      meta: string;
      primaryActionLabel: 'Block time off';
      secondaryActionLabel: 'Share profile';
      primaryActionScreen: AppScreen;
      secondaryActionScreen: AppScreen;
    };

export type ProviderHomeActiveBooking = {
  id: string;
  booking: BookingSummary;
  summary: string;
};

export type ProviderHomeViewModel = {
  hero: ProviderHomeHero;
  payoutAction: ReturnType<typeof buildPayoutAction>;
  activeBookings: ProviderHomeActiveBooking[];
  todayEarnings: number;
  weekEarnings: number;
};

export function nextJobAction(booking: BookingSummary, now: Date): {
  label: 'Navigate' | 'Start Service' | 'Continue';
  screen: AppScreen;
} {
  if (booking.status === 'in_progress') {
    return { label: 'Continue', screen: 'providerServiceInProgress' };
  }

  const scheduledAt = new Date(booking.scheduledAt).getTime();
  const shouldStart = Number.isFinite(scheduledAt)
    ? now.getTime() >= scheduledAt - START_SERVICE_WINDOW_MS
    : false;

  if (shouldStart) {
    return { label: 'Start Service', screen: 'providerStartService' };
  }

  return { label: 'Navigate', screen: 'providerNavigationMode' };
}

export function buildPayoutAction(balance: number, minimumPayoutAmount: number) {
  const disabled = balance < minimumPayoutAmount || balance <= 0;
  const balanceLabel = formatMoney(balance);
  const minimumLabel = formatMoney(minimumPayoutAmount);

  return {
    disabled,
    label: 'Request Payout',
    balanceLabel,
    helperLabel: disabled
      ? `Minimum ${minimumLabel}`
      : balanceLabel,
    accessibilityLabel: disabled
      ? `Request Payout disabled. Available: ${balanceLabel}; minimum ${minimumLabel} to request.`
      : `Request Payout. Available: ${balanceLabel}.`,
  };
}

export function buildProviderHomeViewModel({
  bookings,
  payments,
  payoutTotal,
  minimumPayoutAmount,
  now,
}: {
  bookings: BookingSummary[];
  payments: PaymentSummary[];
  payoutTotal: number;
  minimumPayoutAmount: number;
  now: Date;
}): ProviderHomeViewModel {
  const heroBooking = findTodayHeroBooking(bookings, now);
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
  const hero = heroBooking
    ? buildJobHero(heroBooking, now)
    : pendingBookings.length
      ? buildPendingHero(pendingBookings.length)
      : buildCaughtUpHero();

  return {
    hero,
    payoutAction: buildPayoutAction(payoutTotal, minimumPayoutAmount),
    activeBookings: buildActiveBookings(bookings, hero.kind === 'job' ? hero.bookingId : null),
    todayEarnings: sumPaymentsForDate(payments, now),
    weekEarnings: sumPaymentsForWeek(payments, now),
  };
}

function buildJobHero(booking: BookingSummary, now: Date): ProviderHomeHero {
  const action = nextJobAction(booking, now);

  return {
    kind: 'job',
    title: booking.serviceTitle ?? 'Service booking',
    subtitle: `${formatTime(booking.scheduledAt)} · ${firstName(booking.customerFullName)}`,
    meta: booking.serviceAddress ?? 'Address unavailable',
    bookingId: booking.id,
    primaryActionLabel: action.label,
    primaryActionScreen: action.screen,
  };
}

function buildPendingHero(pendingCount: number): ProviderHomeHero {
  return {
    kind: 'requests',
    title: `${pendingCount} new request${pendingCount === 1 ? '' : 's'}`,
    subtitle: 'Review incoming bookings while customers are still deciding.',
    meta: 'Pending requests',
    pendingCount,
    primaryActionLabel: 'Review requests',
    primaryActionScreen: 'bookings',
  };
}

function buildCaughtUpHero(): ProviderHomeHero {
  return {
    kind: 'caught-up',
    title: 'All caught up.',
    subtitle: 'No jobs or booking requests need action right now.',
    meta: 'Open schedule',
    primaryActionLabel: 'Block time off',
    secondaryActionLabel: 'Share profile',
    primaryActionScreen: 'calendar',
    secondaryActionScreen: 'providerProfileView',
  };
}

function findTodayHeroBooking(bookings: BookingSummary[], now: Date): BookingSummary | null {
  return bookings
    .filter(
      (booking) =>
        ACTIVE_BOOKING_STATUSES.has(booking.status) &&
        isSameManilaDate(booking.scheduledAt, now),
    )
    .slice()
    .sort(sortByScheduledAt)[0] ?? null;
}

function buildActiveBookings(
  bookings: BookingSummary[],
  excludedBookingId: string | null,
): ProviderHomeActiveBooking[] {
  return bookings
    .filter(
      (booking) =>
        ACTIVE_BOOKING_STATUSES.has(booking.status) &&
        booking.id !== excludedBookingId,
    )
    .slice()
    .sort(sortByScheduledAt)
    .slice(0, 3)
    .map((booking) => ({
      id: booking.id,
      booking,
      summary: `${formatTime(booking.scheduledAt)} · ${booking.serviceTitle ?? 'Service'} · ${
        firstName(booking.customerFullName)
      }`,
    }));
}

function sumPaymentsForDate(payments: PaymentSummary[], now: Date): number {
  const todayKey = manilaDateKey(now);

  return payments
    .filter((payment) => payment.status === 'paid')
    .filter((payment) => {
      const paidAt = payment.paidAt ?? payment.createdAt;
      return paidAt ? manilaDateKey(new Date(paidAt)) === todayKey : false;
    })
    .reduce((total, payment) => total + payment.providerPayout, 0);
}

function sumPaymentsForWeek(payments: PaymentSummary[], now: Date): number {
  const weekStart = startOfLocalWeek(now).getTime();
  const weekEnd = now.getTime();

  return payments
    .filter((payment) => payment.status === 'paid')
    .filter((payment) => {
      const paidAt = payment.paidAt ?? payment.createdAt;
      const time = paidAt ? new Date(paidAt).getTime() : NaN;
      return Number.isFinite(time) && time >= weekStart && time <= weekEnd;
    })
    .reduce((total, payment) => total + payment.providerPayout, 0);
}

function startOfLocalWeek(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function isSameManilaDate(value: string, now: Date): boolean {
  return manilaDateKey(new Date(value)) === manilaDateKey(now);
}

function manilaDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: MANILA_TIME_ZONE });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-PH', {
    timeZone: MANILA_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  });
}

function firstName(value: string | null | undefined): string {
  return value?.trim().split(/\s+/)[0] ?? 'Customer';
}

function sortByScheduledAt(a: BookingSummary, b: BookingSummary): number {
  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
}
