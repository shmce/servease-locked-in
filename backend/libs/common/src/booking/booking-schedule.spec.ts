import {
  isFutureBookingSchedule,
  isProviderServiceStartWindowOpen,
  PROVIDER_SERVICE_START_WINDOW_MINUTES,
} from './booking-schedule';

describe('booking schedule helpers', () => {
  it('validates future booking schedules', () => {
    expect(
      isFutureBookingSchedule(
        '2026-07-20T08:00:00.000Z',
        new Date('2026-07-20T07:59:59.000Z'),
      ),
    ).toBe(true);
    expect(
      isFutureBookingSchedule(
        '2026-07-20T07:59:00.000Z',
        new Date('2026-07-20T08:00:00.000Z'),
      ),
    ).toBe(false);
    expect(isFutureBookingSchedule('not-a-date')).toBe(false);
  });

  it('opens provider service starts thirty minutes before schedule', () => {
    expect(PROVIDER_SERVICE_START_WINDOW_MINUTES).toBe(30);
    expect(
      isProviderServiceStartWindowOpen(
        '2026-07-20T08:00:00.000Z',
        new Date('2026-07-20T07:29:00.000Z'),
      ),
    ).toBe(false);
    expect(
      isProviderServiceStartWindowOpen(
        '2026-07-20T08:00:00.000Z',
        new Date('2026-07-20T07:30:00.000Z'),
      ),
    ).toBe(true);
  });
});
