export const PROVIDER_SERVICE_START_WINDOW_MINUTES = 30;
export const PROVIDER_SERVICE_START_WINDOW_MS =
  PROVIDER_SERVICE_START_WINDOW_MINUTES * 60 * 1000;

export function parseBookingScheduleInstant(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function isFutureBookingSchedule(
  value: string | null | undefined,
  now = new Date(),
): boolean {
  const scheduledAt = parseBookingScheduleInstant(value);
  const nowTime = now.getTime();

  return (
    scheduledAt !== null &&
    Number.isFinite(nowTime) &&
    scheduledAt.getTime() >= nowTime
  );
}

export function isProviderServiceStartWindowOpen(
  scheduledAtValue: string | null | undefined,
  now = new Date(),
): boolean {
  const scheduledAt = parseBookingScheduleInstant(scheduledAtValue);
  const nowTime = now.getTime();

  return (
    scheduledAt !== null &&
    Number.isFinite(nowTime) &&
    nowTime >= scheduledAt.getTime() - PROVIDER_SERVICE_START_WINDOW_MS
  );
}
