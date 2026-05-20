import { useCallback, useMemo, useState } from 'react';
import {
  MonthCalendarMarkers,
  formatApiDate,
} from '../../../components/MonthCalendar';
import {
  BookingStatus,
  BookingSummary,
} from '../../../shared/models/types';
import { formatDateTime } from '../../../shared/utils/booking';

const activeBookingStatuses: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
];

const upcomingPreviewLimit = 3;

export function useCustomerCalendarViewModel({
  bookings,
  onRefresh,
}: {
  bookings: BookingSummary[];
  onRefresh: () => Promise<void> | void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);

  const activeBookings = useMemo(
    () =>
      bookings
        .filter((booking) => activeBookingStatuses.includes(booking.status))
        .slice()
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        ),
    [bookings],
  );

  const activeBookingsByDate = useMemo(() => {
    const dates = new Set<string>();
    activeBookings.forEach((booking) => {
      dates.add(formatApiDate(new Date(booking.scheduledAt)));
    });
    return dates;
  }, [activeBookings]);

  const calendarMarkers = useMemo<MonthCalendarMarkers>(() => {
    const markers: MonthCalendarMarkers = {};
    activeBookingsByDate.forEach((date) => {
      markers[date] = 'booking';
    });
    return markers;
  }, [activeBookingsByDate]);

  const selectedDateBookings = useMemo(
    () =>
      selectedDate
        ? activeBookings.filter(
            (booking) => formatApiDate(new Date(booking.scheduledAt)) === selectedDate,
          )
        : activeBookings.slice(0, upcomingPreviewLimit),
    [activeBookings, selectedDate],
  );

  const agendaTitle = selectedDate ? 'Bookings on selected date' : 'Next up';
  const emptyTitle = selectedDate ? 'No bookings this day' : 'No active bookings';
  const emptyBody = selectedDate
    ? 'Pick another marked date or browse services to schedule something new.'
    : 'Upcoming bookings will appear here after you book a service.';

  return {
    data: {
      agendaTitle,
      calendarMarkers,
      emptyBody,
      emptyTitle,
      isShowingUpcomingPreview: !selectedDate,
      selectedDate,
      selectedDateBookings: selectedDateBookings.map((booking) => ({
        booking,
        scheduledAtLabel: formatDateTime(booking.scheduledAt),
        statusLabel: booking.status.replace('_', ' '),
        title: booking.serviceTitle ?? 'Service booking',
      })),
    },
    isLoading,
    error: null,
    refreshBookings,
    selectDate: setSelectedDate,
  };
}
