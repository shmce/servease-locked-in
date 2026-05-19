import {
  BookingPricingMode,
  BookingStatus,
  PaymentSummary,
  ProviderAvailabilitySchedule,
  UserRole,
} from '../../services/serveaseApi';

const MANILA_TIME_ZONE = 'Asia/Manila';
const MANILA_UTC_OFFSET = '+08:00';
const dateTimeInputPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const dateTimeWithSecondsInputPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const dayKeys = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface BookingSlot {
  label: string;
  value: string;
}

export interface StatusChipModel {
  label: string;
  tone: StatusTone;
}

export interface BookingTransitionRequest {
  currentStatus: BookingStatus;
  nextStatus: BookingStatus;
  reason?: string | null;
  explanation?: string | null;
}

export interface CalendarExportInput {
  bookingReference: string;
  serviceTitle?: string | null;
  serviceAddress?: string | null;
  scheduledAt: string;
  durationMinutes?: number;
}

export function bookingStatusChip(status: BookingStatus): StatusChipModel {
  if (status === 'completed') {
    return { label: 'completed', tone: 'success' };
  }

  if (status === 'cancelled' || status === 'rejected') {
    return { label: status, tone: 'danger' };
  }

  if (status === 'confirmed' || status === 'in_progress') {
    return { label: status.replace('_', ' '), tone: 'neutral' };
  }

  return { label: status, tone: 'warning' };
}

export function nextBookingStatuses(
  status: BookingStatus,
  role: UserRole | 'guest',
): BookingStatus[] {
  if (role === 'provider') {
    if (status === 'pending') {
      return ['confirmed', 'rejected'];
    }

    if (status === 'confirmed') {
      return ['in_progress'];
    }
  }

  if (status === 'in_progress') {
    return ['completed'];
  }

  if (status === 'pending' || status === 'confirmed') {
    return ['cancelled'];
  }

  return [];
}

export function nextActionLabel(
  status: BookingStatus,
  role: UserRole | 'guest',
): string {
  const nextStatuses = nextBookingStatuses(status, role);
  return nextStatuses[0] ? statusActionLabel(nextStatuses[0]) : 'No action required';
}

export function buildBookingTransitionRequest(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
  reason?: string | null,
): BookingTransitionRequest {
  const trimmedReason = reason?.trim();

  if (nextStatus !== 'cancelled' || !trimmedReason) {
    return {
      currentStatus,
      nextStatus,
    };
  }

  return {
    currentStatus,
    nextStatus,
    reason: trimmedReason,
    explanation: trimmedReason,
  };
}

export function statusActionLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'Request',
    confirmed: 'Accept',
    in_progress: 'Start service',
    completed: 'Mark complete',
    cancelled: 'Cancel',
    rejected: 'Decline',
  };
  return labels[status];
}

export function timelineEventLabel(event: {
  eventType?: string | null;
  label?: string | null;
}): string {
  const rawLabel = event.label?.trim();
  const status = rawLabel?.match(/^Booking status changed to ([a-z_]+)$/i)?.[1];

  if (status && isBookingStatus(status)) {
    return statusTimelineLabel(status);
  }

  if (rawLabel) {
    return rawLabel.replace(/_/g, ' ');
  }

  if (event.eventType === 'created') {
    return 'Booking requested';
  }

  return 'Booking update';
}

function isBookingStatus(value: string): value is BookingStatus {
  return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'].includes(
    value,
  );
}

function statusTimelineLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'Booking requested',
    confirmed: 'Provider confirmed booking',
    in_progress: 'Service in progress',
    completed: 'Service completed',
    cancelled: 'Booking cancelled',
    rejected: 'Booking declined',
  };
  return labels[status];
}

export function statusLabel(status: BookingStatus): string {
  return status.replace('_', ' ');
}

export function buildCalendarExportUrl(input: CalendarExportInput): string | null {
  const startsAt = new Date(input.scheduledAt);
  if (Number.isNaN(startsAt.getTime())) {
    return null;
  }

  const durationMinutes =
    input.durationMinutes && input.durationMinutes > 0
      ? input.durationMinutes
      : 120;
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `ServEase: ${input.serviceTitle?.trim() || 'Service booking'}`,
    dates: `${formatCalendarInstant(startsAt)}/${formatCalendarInstant(endsAt)}`,
    details: `Booking ${input.bookingReference}`,
  });

  if (input.serviceAddress?.trim()) {
    params.set('location', input.serviceAddress.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildMapsDirectionsUrl(destination?: string | null): string | null {
  const trimmedDestination = destination?.trim();
  if (!trimmedDestination) {
    return null;
  }

  const params = new URLSearchParams({
    api: '1',
    destination: trimmedDestination,
    travelmode: 'driving',
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function formatCalendarInstant(value: Date): string {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function roleLabel(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

export function formatBookingDuration(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || !Number.isFinite(hours) || hours <= 0) {
    return 'Not specified';
  }

  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);

  if (minutes === 0) {
    return `${whole} hour${whole === 1 ? '' : 's'}`;
  }

  if (whole === 0) {
    return `${minutes} min`;
  }

  return `${whole} hr ${minutes} min`;
}

export function pricingModeLabel(mode: BookingPricingMode | null | undefined): string {
  if (mode === 'hourly') {
    return 'Hourly rate';
  }

  if (mode === 'flat') {
    return 'Flat rate';
  }

  return 'Standard rate';
}

export function pricingFairnessLabel(
  status: 'below_range' | 'within_range' | 'above_range' | null | undefined,
): string {
  if (status === 'below_range') {
    return 'Below fair range';
  }

  if (status === 'above_range') {
    return 'Above fair range';
  }

  if (status === 'within_range') {
    return 'Within fair range';
  }

  return 'Fairness pending';
}

export function pricingConfidenceLabel(
  confidence: 'high' | 'medium' | 'low' | null | undefined,
): string {
  if (confidence === 'high') {
    return 'High confidence';
  }

  if (confidence === 'medium') {
    return 'Medium confidence';
  }

  if (confidence === 'low') {
    return 'Low confidence';
  }

  return 'Confidence pending';
}

export function formatMoney(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Price pending';
  }

  return `PHP ${value.toLocaleString('en-PH')}`;
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Not scheduled';
  }

  return new Date(value).toLocaleString('en-PH', {
    timeZone: MANILA_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toManilaBookingIso(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const dateTimeValue = dateTimeInputPattern.test(trimmedValue)
    ? `${trimmedValue}:00${MANILA_UTC_OFFSET}`
    : dateTimeWithSecondsInputPattern.test(trimmedValue)
      ? `${trimmedValue}${MANILA_UTC_OFFSET}`
      : trimmedValue;
  const date = new Date(dateTimeValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function buildProviderBookingSlots(
  schedule: ProviderAvailabilitySchedule | null,
  durationHours: number,
  timeSlots: string[],
  startDate = new Date(),
): BookingSlot[] {
  if (!schedule) {
    return [];
  }

  const safeDuration = Math.max(1, Math.floor(durationHours) || 1);
  const offDates = new Set(schedule.daysOff.map((dayOff) => dayOff.offDate));
  const timeOffWindowsByDate = new Map<
    string,
    { startTime: string; endTime: string }[]
  >();
  (schedule.timeOffWindows ?? []).forEach((window) => {
    const windows = timeOffWindowsByDate.get(window.offDate) ?? [];
    windows.push({
      startTime: window.startTime,
      endTime: window.endTime,
    });
    timeOffWindowsByDate.set(window.offDate, windows);
  });
  const slots: BookingSlot[] = [];

  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);

    const dateValue = formatDateInput(date);
    if (offDates.has(dateValue)) {
      continue;
    }

    const dayOfWeek = dayKeys[date.getDay()];
    const windows = schedule.windows.filter(
      (window) => window.isActive && window.dayOfWeek === dayOfWeek,
    );

    for (const time of timeSlots) {
      const endTime = addHoursToTime(time, safeDuration);
      const fitsWindow = windows.some(
        (window) => window.startTime <= time && window.endTime >= endTime,
      );
      const overlapsTimeOff = (timeOffWindowsByDate.get(dateValue) ?? []).some(
        (window) => time < window.endTime && endTime > window.startTime,
      );

      if (fitsWindow && !overlapsTimeOff) {
        slots.push({
          label: `${date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
          })} ${time}`,
          value: `${dateValue}T${time}`,
        });
      }
    }
  }

  return slots.slice(0, 12);
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addHoursToTime(value: string, hours: number): string {
  const [rawHour, rawMinute] = value.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  return `${`${hour + hours}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}

export function activeBookingCount(statuses: BookingStatus[]): number {
  return statuses.filter((status) =>
    ['pending', 'confirmed', 'in_progress'].includes(status),
  ).length;
}

export function completedBookingCount(statuses: BookingStatus[]): number {
  return statuses.filter((status) => status === 'completed').length;
}

export function providerPayoutTotal(payments: PaymentSummary[]): number {
  return payments
    .filter((payment) => payment.status === 'paid' || payment.status === 'pending')
    .reduce((total, payment) => total + payment.providerPayout, 0);
}

export interface MonthlyEarningSummary {
  monthKey: string;
  monthLabel: string;
  totalPayout: number;
  totalPlatformFee: number;
  paidCount: number;
  pendingCount: number;
}

export function summarizeMonthlyEarnings(
  payments: PaymentSummary[],
): MonthlyEarningSummary[] {
  const buckets = new Map<string, MonthlyEarningSummary>();

  for (const payment of payments) {
    const referenceDate = payment.paidAt ?? payment.createdAt;
    if (!referenceDate) {
      continue;
    }
    const date = new Date(referenceDate);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const monthKey = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-PH', {
      month: 'long',
      year: 'numeric',
      timeZone: MANILA_TIME_ZONE,
    });

    const existing = buckets.get(monthKey) ?? {
      monthKey,
      monthLabel,
      totalPayout: 0,
      totalPlatformFee: 0,
      paidCount: 0,
      pendingCount: 0,
    };

    if (payment.status === 'paid' || payment.status === 'pending') {
      existing.totalPayout += payment.providerPayout;
      existing.totalPlatformFee += payment.platformFee;
    }

    if (payment.status === 'paid') {
      existing.paidCount += 1;
    } else if (payment.status === 'pending') {
      existing.pendingCount += 1;
    }

    buckets.set(monthKey, existing);
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.monthKey < b.monthKey ? 1 : a.monthKey > b.monthKey ? -1 : 0,
  );
}
