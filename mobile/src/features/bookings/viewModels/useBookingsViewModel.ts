import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BookingStatus,
  BookingSummary,
} from '../../../shared/models/types';

export type BookingFilter = 'active' | 'completed';
export type BookingTabKey = 'upcoming' | 'completed';
export type BookingCardIconKey =
  | 'cleaning'
  | 'electrical'
  | 'garden'
  | 'home-care'
  | 'plumbing'
  | 'repair';
export type BookingStatusTone =
  | 'danger'
  | 'neutral'
  | 'success'
  | 'warning';

export type BookingCardRow = {
  booking: BookingSummary;
  dateLabel: string;
  iconKey: BookingCardIconKey;
  id: string;
  providerLabel: string;
  serviceKindLabel: string;
  statusBadge: {
    label: string;
    tone: BookingStatusTone;
  };
  timeLabel: string;
  title: string;
};

type BookingsViewModelInput = {
  bookings: BookingSummary[];
  bookingFilter: BookingFilter;
  page?: number;
};

const MANILA_TIME_ZONE = 'Asia/Manila';
const bookingPageSize = 5;
const CLOSED_BOOKING_STATUSES = new Set<BookingStatus>([
  'completed',
  'cancelled',
  'rejected',
]);
const ACTIVE_BOOKING_PRIORITY: Partial<Record<BookingStatus, number>> = {
  in_progress: 0,
  confirmed: 1,
  pending: 2,
};

export function useBookingsViewModel({
  bookings,
  bookingFilter,
}: BookingsViewModelInput) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [bookingFilter]);

  const data = useMemo(
    () => buildBookingsViewModel({ bookings, bookingFilter, page: currentPage }).data,
    [bookingFilter, bookings, currentPage],
  );

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(
    () => {
      setCurrentPage((page) => Math.min(data.pagination.totalPages, page + 1));
    },
    [data.pagination.totalPages],
  );

  return {
    data,
    isLoading: false,
    error: null,
    actions: {
      goToNextPage,
      goToPreviousPage,
    },
  };
}

export function buildBookingsViewModel({
  bookings,
  bookingFilter,
  page = 1,
}: BookingsViewModelInput) {
  const visibleBookings = bookings.filter((booking) =>
    bookingFilter === 'completed'
      ? booking.status === 'completed'
      : !CLOSED_BOOKING_STATUSES.has(booking.status),
  );
  const activeBookings = bookings
    .filter((booking) => !CLOSED_BOOKING_STATUSES.has(booking.status))
    .sort(sortActiveBookings);
  const tabKey: BookingTabKey = bookingFilter === 'completed' ? 'completed' : 'upcoming';
  const pagination = buildPagination(visibleBookings.length, page, bookingPageSize);
  const pageBookings = visibleBookings.slice(pagination.startIndex, pagination.endIndex);
  const cardRows = pageBookings.map(buildBookingCardRow);
  const emptyState =
    tabKey === 'completed'
      ? {
          title: 'No completed bookings',
          body: 'Completed services will appear here after your provider wraps up the job.',
        }
      : {
          title: 'No upcoming bookings',
          body: 'Book a trusted provider and your upcoming services will appear here.',
        };

  return {
    data: {
      activeBookings,
      cardRows,
      emptyState,
      helperTargetBooking: activeBookings[0] ?? null,
      isEmpty: cardRows.length === 0,
      pagination: {
        currentPage: pagination.currentPage,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
        pageLabel:
          pagination.totalItems > 0
            ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
            : 'No bookings',
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
      },
      selectedTab: tabKey,
      tabs: [
        { key: 'upcoming' as const, filter: 'active' as const, label: 'Upcoming' },
        { key: 'completed' as const, filter: 'completed' as const, label: 'Completed' },
      ],
      visibleBookings,
    },
    isLoading: false,
    error: null,
  };
}

function buildPagination(totalItems: number, requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    endIndex: startIndex + pageSize,
    startIndex,
    totalItems,
    totalPages,
  };
}

function buildBookingCardRow(booking: BookingSummary): BookingCardRow {
  const { dateLabel, timeLabel } = formatScheduleParts(booking.scheduledAt);

  return {
    booking,
    dateLabel,
    iconKey: iconKeyForBooking(booking),
    id: booking.id,
    providerLabel: providerLabel(booking),
    serviceKindLabel: 'One-time service',
    statusBadge: statusBadgeForBooking(booking.status),
    timeLabel,
    title: displayText(booking.serviceTitle, 'Service booking'),
  };
}

function formatScheduleParts(value: string | null): {
  dateLabel: string;
  timeLabel: string;
} {
  if (!value) {
    return {
      dateLabel: 'Schedule pending',
      timeLabel: 'Time pending',
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      dateLabel: 'Schedule pending',
      timeLabel: 'Time pending',
    };
  }

  return {
    dateLabel: date.toLocaleDateString('en-PH', {
      day: 'numeric',
      month: 'short',
      timeZone: MANILA_TIME_ZONE,
      year: 'numeric',
    }),
    timeLabel: date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: MANILA_TIME_ZONE,
    }),
  };
}

function statusBadgeForBooking(status: BookingStatus): BookingCardRow['statusBadge'] {
  const toneByStatus: Record<BookingStatus, BookingStatusTone> = {
    pending: 'warning',
    confirmed: 'neutral',
    in_progress: 'neutral',
    completed: 'success',
    cancelled: 'danger',
    rejected: 'danger',
  };

  return {
    label: titleCase(status.replace('_', ' ')),
    tone: toneByStatus[status],
  };
}

function providerLabel(booking: BookingSummary): string {
  return (
    optionalDisplayText(booking.providerBusinessName) ??
    optionalDisplayText(booking.bookingReference) ??
    `SE-${booking.providerId.slice(0, 8)}`
  );
}

function iconKeyForBooking(booking: BookingSummary): BookingCardIconKey {
  const value = [
    booking.serviceTitle,
    booking.serviceDescription,
    booking.providerBusinessName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (matchesAny(value, ['plumb', 'pipe', 'faucet', 'water'])) {
    return 'plumbing';
  }
  if (matchesAny(value, ['electric', 'wiring', 'lighting'])) {
    return 'electrical';
  }
  if (matchesAny(value, ['garden', 'plant', 'lawn', 'yard'])) {
    return 'garden';
  }
  if (matchesAny(value, ['home care', 'care', 'wellness'])) {
    return 'home-care';
  }
  if (matchesAny(value, ['repair', 'handyman', 'fix', 'maintenance'])) {
    return 'repair';
  }
  return 'cleaning';
}

function matchesAny(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}

function sortActiveBookings(a: BookingSummary, b: BookingSummary): number {
  const priorityDelta =
    (ACTIVE_BOOKING_PRIORITY[a.status] ?? 99) -
    (ACTIVE_BOOKING_PRIORITY[b.status] ?? 99);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const timeDelta = safeTime(a.scheduledAt) - safeTime(b.scheduledAt);
  if (timeDelta !== 0) {
    return timeDelta;
  }

  return a.id.localeCompare(b.id);
}

function safeTime(value: string | null): number {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function displayText(value: string | null | undefined, fallback: string): string {
  return optionalDisplayText(value) ?? fallback;
}

function optionalDisplayText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .map((part) => (part ? `${part.slice(0, 1).toUpperCase()}${part.slice(1)}` : part))
    .join(' ');
}
