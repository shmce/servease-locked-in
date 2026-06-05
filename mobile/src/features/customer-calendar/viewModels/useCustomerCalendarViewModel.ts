import { useCallback, useMemo, useState } from 'react';
import type { MonthCalendarMarkers } from '../../../components/MonthCalendar';
import { formatApiDate } from '../../../components/MonthCalendarModel';
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
  const [selectedDatePage, setSelectedDatePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);

  const agenda = useMemo(
    () =>
      buildCustomerCalendarAgenda({
        bookings,
        page: selectedDatePage,
        selectedDate,
      }),
    [bookings, selectedDate, selectedDatePage],
  );
  const activeBookings = agenda.activeBookings;

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

  const selectDate = useCallback((date: string | null) => {
    setSelectedDate(date);
    setSelectedDatePage(1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setSelectedDatePage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(
    () => {
      setSelectedDatePage((page) => Math.min(agenda.pagination.totalPages, page + 1));
    },
    [agenda.pagination.totalPages],
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
      pagination: agenda.pagination,
      selectedDate,
      selectedDateBookings: agenda.selectedDateBookings,
    },
    isLoading,
    error: null,
    refreshBookings,
    selectDate,
    actions: {
      goToNextPage,
      goToPreviousPage,
    },
  };
}

export function buildCustomerCalendarAgenda({
  bookings,
  selectedDate,
  page = 1,
}: {
  bookings: BookingSummary[];
  selectedDate: string | null;
  page?: number;
}) {
  const activeBookings = bookings
    .filter((booking) => activeBookingStatuses.includes(booking.status))
    .slice()
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  const agendaBookings = selectedDate
    ? activeBookings.filter(
        (booking) => formatApiDate(new Date(booking.scheduledAt)) === selectedDate,
      )
    : activeBookings.slice(0, upcomingPreviewLimit);
  const pagination = selectedDate
    ? buildAgendaPagination(agendaBookings.length, page)
    : buildAgendaPagination(agendaBookings.length, 1);
  const pageBookings = selectedDate
    ? agendaBookings.slice(pagination.startIndex, pagination.endIndex)
    : agendaBookings;

  return {
    activeBookings,
    pagination: {
      currentPage: pagination.currentPage,
      hasNextPage: selectedDate !== null && pagination.currentPage < pagination.totalPages,
      hasPreviousPage: selectedDate !== null && pagination.currentPage > 1,
      pageLabel:
        pagination.totalItems > 0
          ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
          : 'No bookings',
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
    },
    selectedDateBookings: pageBookings.map((booking) => ({
      booking,
      scheduledAtLabel: formatDateTime(booking.scheduledAt),
      statusLabel: booking.status.replace('_', ' '),
      title: booking.serviceTitle ?? 'Service booking',
    })),
  };
}

function buildAgendaPagination(totalItems: number, requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / upcomingPreviewLimit));
  const currentPage = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  const startIndex = (currentPage - 1) * upcomingPreviewLimit;

  return {
    currentPage,
    endIndex: startIndex + upcomingPreviewLimit,
    startIndex,
    totalItems,
    totalPages,
  };
}
