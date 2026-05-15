import { BookingStatus, PaymentSummary, UserRole } from '../../services/serveaseApi';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusChipModel {
  label: string;
  tone: StatusTone;
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

export function statusActionLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'Request',
    confirmed: 'Accept',
    in_progress: 'Start job',
    completed: 'Mark complete',
    cancelled: 'Cancel',
    rejected: 'Decline',
  };
  return labels[status];
}

export function statusLabel(status: BookingStatus): string {
  return status.replace('_', ' ');
}

export function roleLabel(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
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
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
