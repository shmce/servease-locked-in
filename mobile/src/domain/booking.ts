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

export interface CustomerBookingDateOption {
  value: string;
  weekday: string;
  day: number;
  month: string;
  isToday: boolean;
  isTomorrow: boolean;
  isAvailable: boolean;
  unavailableLabel?: string;
}

export interface CustomerBookingTimeOption {
  time: string;
  isAvailable: boolean;
  unavailableLabel?: string;
}

export interface CustomerBookingAvailability {
  dateOptions: CustomerBookingDateOption[];
  timeOptions: CustomerBookingTimeOption[];
}

export interface CustomerBookingCalendarState {
  disabledDates: Set<string>;
  markers: Record<string, 'partial'>;
}

export const providerUnavailableSlotPickerCopy =
  'This slot was just taken or blocked. Please pick another.';

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

export function formatManilaDateInput(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-PH', {
    timeZone: MANILA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return formatDateInput(date);
  }

  return `${year}-${month}-${day}`;
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

export function buildCustomerBookingAvailability(
  schedule: ProviderAvailabilitySchedule | null,
  durationHours: number,
  timeSlots: string[],
  startDate = new Date(),
  selectedDateValue = formatDateInput(startDate),
): CustomerBookingAvailability {
  const safeDuration = Math.max(1, Math.floor(durationHours) || 1);
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);
  const offDates = new Set(schedule?.daysOff.map((dayOff) => dayOff.offDate) ?? []);
  const unavailableLabel = 'Provider unavailable';

  const dateOptions = Array.from({ length: 14 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const value = formatDateInput(date);
    const { hasAvailableSlot } = customerDateSlotState(
      schedule,
      value,
      safeDuration,
      timeSlots,
    );
    const isAvailable = !offDates.has(value) && hasAvailableSlot;

    return {
      value,
      weekday: date.toLocaleDateString('en-PH', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-PH', { month: 'short' }),
      isToday: offset === 0,
      isTomorrow: offset === 1,
      isAvailable,
      unavailableLabel: isAvailable ? undefined : unavailableLabel,
    };
  });

  const selectedDate = dateFromInputValue(selectedDateValue) ?? today;
  const selectedWindows = activeWindowsForDate(schedule, selectedDate);
  const selectedDateOff = offDates.has(selectedDateValue);
  const selectedTimeOffWindows =
    schedule?.timeOffWindows.filter((window) => window.offDate === selectedDateValue) ?? [];
  const timeOptions = timeSlots.map((time) => {
    const endTime = addHoursToTime(time, safeDuration);
    const fitsWindow = selectedWindows.some(
      (window) => window.startTime <= time && window.endTime >= endTime,
    );
    const overlapsTimeOff = selectedTimeOffWindows.some(
      (window) => time < window.endTime && endTime > window.startTime,
    );
    const isAvailable = !selectedDateOff && fitsWindow && !overlapsTimeOff;

    return {
      time,
      isAvailable,
      unavailableLabel: isAvailable ? undefined : unavailableLabel,
    };
  });

  return { dateOptions, timeOptions };
}

export function buildCustomerBookingCalendarState(
  schedule: ProviderAvailabilitySchedule | null,
  durationHours: number,
  timeSlots: string[],
  month: string,
): CustomerBookingCalendarState {
  const safeDuration = Math.max(1, Math.floor(durationHours) || 1);
  const disabledDates = new Set<string>();
  const markers: Record<string, 'partial'> = {};
  const monthDate = dateFromMonthInput(month);
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const offDates = new Set(schedule?.daysOff.map((dayOff) => dayOff.offDate) ?? []);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = formatDateInput(
      new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
    );
    const { hasAvailableSlot, hasBlockedSlot } = customerDateSlotState(
      schedule,
      value,
      safeDuration,
      timeSlots,
    );

    if (offDates.has(value) || !hasAvailableSlot) {
      disabledDates.add(value);
      continue;
    }

    if (hasBlockedSlot) {
      markers[value] = 'partial';
    }
  }

  return { disabledDates, markers };
}

export function providerUnavailableSlotPickerMessage(
  error: unknown,
  message: string,
): string | null {
  const apiErrorCode = (error as { code?: unknown })?.code;
  const normalizedMessage = message.toLowerCase();

  if (
    apiErrorCode === 'provider_unavailable' ||
    normalizedMessage.includes('provider is unavailable')
  ) {
    return providerUnavailableSlotPickerCopy;
  }

  return null;
}

function activeWindowsForDate(
  schedule: ProviderAvailabilitySchedule | null,
  date: Date,
): ProviderAvailabilitySchedule['windows'] {
  if (!schedule) {
    return [];
  }

  const dayOfWeek = dayKeys[date.getDay()];

  return schedule.windows.filter(
    (window) => window.isActive && window.dayOfWeek === dayOfWeek,
  );
}

function customerDateSlotState(
  schedule: ProviderAvailabilitySchedule | null,
  dateValue: string,
  durationHours: number,
  timeSlots: string[],
): { hasAvailableSlot: boolean; hasBlockedSlot: boolean } {
  const date = dateFromInputValue(dateValue);
  if (!schedule || !date) {
    return { hasAvailableSlot: false, hasBlockedSlot: false };
  }

  const windows = activeWindowsForDate(schedule, date);
  const timeOffWindows = schedule.timeOffWindows.filter(
    (window) => window.offDate === dateValue,
  );
  let hasAvailableSlot = false;
  let hasBlockedSlot = false;

  for (const time of timeSlots) {
    const endTime = addHoursToTime(time, durationHours);
    const fitsWindow = windows.some(
      (window) => window.startTime <= time && window.endTime >= endTime,
    );
    const overlapsTimeOff = timeOffWindows.some(
      (window) => time < window.endTime && endTime > window.startTime,
    );

    if (fitsWindow && !overlapsTimeOff) {
      hasAvailableSlot = true;
    }

    if (fitsWindow && overlapsTimeOff) {
      hasBlockedSlot = true;
    }
  }

  return { hasAvailableSlot, hasBlockedSlot };
}

function dateFromMonthInput(value: string): Date {
  const [rawYear, rawMonth] = value.slice(0, 7).split('-');
  const year = Number(rawYear);
  const month = Number(rawMonth);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
}

function dateFromInputValue(value: string): Date | null {
  const [rawYear, rawMonth, rawDay] = value.split('-');
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
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
