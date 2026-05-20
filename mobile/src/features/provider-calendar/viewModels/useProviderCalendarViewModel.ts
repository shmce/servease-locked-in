import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MonthCalendarMarkers,
  formatApiDate,
} from '../../../components/MonthCalendar';
import {
  ApiOptions,
  BookingStatus,
  BookingSummary,
  ProviderAvailabilitySchedule,
} from '../../../shared/models/types';
import {
  getProviderAvailability,
} from '../../../shared/models/apiService';
import { formatDateTime } from '../../../shared/utils/booking';

const activeBookingStatuses: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
];

export function useProviderCalendarViewModel({
  availability,
  bookings,
  apiOptions,
  onScheduleLoaded,
}: {
  availability: ProviderAvailabilitySchedule | null;
  bookings: BookingSummary[];
  apiOptions: ApiOptions;
  onScheduleLoaded: (schedule: ProviderAvailabilitySchedule) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      onScheduleLoaded(await getProviderAvailability(apiOptions));
    } finally {
      setIsLoading(false);
    }
  }, [apiOptions, onScheduleLoaded]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const dayOffDates = useMemo(
    () => new Set(availability?.daysOff.map((day) => day.offDate) ?? []),
    [availability],
  );
  const timeOffDates = useMemo(
    () =>
      new Set((availability?.timeOffWindows ?? []).map((window) => window.offDate)),
    [availability],
  );
  const activeBookingsByDate = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      if (activeBookingStatuses.includes(booking.status)) {
        dates.add(formatApiDate(new Date(booking.scheduledAt)));
      }
    });
    return dates;
  }, [bookings]);
  const calendarMarkers = useMemo<MonthCalendarMarkers>(() => {
    const markers: MonthCalendarMarkers = {};
    dayOffDates.forEach((date) => {
      markers[date] = appendMarker(markers[date], 'full');
    });
    timeOffDates.forEach((date) => {
      if (!dayOffDates.has(date)) {
        markers[date] = appendMarker(markers[date], 'partial');
      }
    });
    activeBookingsByDate.forEach((date) => {
      markers[date] = appendMarker(markers[date], 'booking');
    });
    return markers;
  }, [activeBookingsByDate, dayOffDates, timeOffDates]);
  const upcoming = useMemo(
    () =>
      bookings
        .filter((booking) => activeBookingStatuses.includes(booking.status))
        .slice()
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        )
        .slice(0, 5),
    [bookings],
  );
  const upcomingRows = useMemo(
    () =>
      upcoming.map((booking) => ({
        booking,
        scheduledAtLabel: formatDateTime(booking.scheduledAt),
        statusLabel: booking.status.replace('_', ' '),
        title: booking.serviceTitle ?? 'Service booking',
      })),
    [upcoming],
  );

  return {
    data: {
      calendarMarkers,
      upcomingRows,
    },
    isLoading,
    error: null,
    loadSchedule,
  };
}

function appendMarker(
  marker: MonthCalendarMarkers[string],
  next: 'full' | 'partial' | 'booking',
): MonthCalendarMarkers[string] {
  if (!marker) {
    return next;
  }

  return Array.isArray(marker) ? [...marker, next] : [marker, next];
}
