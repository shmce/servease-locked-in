import {
  BookingAttachmentSummary,
  BookingStatus,
} from '../booking-lifecycle/booking.types';

export type AdminBookingEscalationPriority =
  | 'critical'
  | 'high'
  | 'low'
  | 'medium';

export interface AdminBookingSummary {
  id: string;
  bookingReference: string;
  customerId: string;
  providerId: string;
  serviceId: string | null;
  serviceTitle: string | null;
  serviceAddress: string | null;
  scheduledAt: string;
  status: BookingStatus;
  totalAmount: number;
  cancelReason: string | null;
  cancelExplanation: string | null;
  cancelledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  escalationCount: number;
  latestEscalationPriority: AdminBookingEscalationPriority | null;
  latestEscalationReason: string | null;
  latestEscalatedAt: string | null;
  attachments: BookingAttachmentSummary[];
}

export interface AdminBookingsByStatus {
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  rejected: number;
}

export interface AdminBookingsSummaryStats {
  totalCount: number;
  byStatus: AdminBookingsByStatus;
  totalRevenue: number;
  recentCount: number;
}

export interface AdminOperationsAlerts {
  pendingBookings: number;
  overdueBookings: number;
  openSupportTickets: number;
  openDisputes: number;
  pendingProviderApplications: number;
  flaggedReviews: number;
}

export interface ListAdminBookingsFilter {
  status?: BookingStatus | null;
  query?: string | null;
  limit?: number | null;
}

export interface CancelAdminBookingInput {
  bookingId: string;
  adminUserId: string;
  reason: string;
  explanation?: string | null;
}

export interface EscalateAdminBookingInput {
  bookingId: string;
  adminUserId: string;
  reason: string;
  priority?: AdminBookingEscalationPriority | null;
}

export type AdminBookingMessageRole = 'admin' | 'provider' | 'customer';

export interface AdminBookingMessage {
  id: string;
  bookingId: string;
  senderUserId: string;
  senderRole: AdminBookingMessageRole;
  body: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AppendAdminBookingMessageInput {
  bookingId: string;
  senderUserId: string;
  senderRole: AdminBookingMessageRole;
  body: string;
  metadata?: Record<string, unknown> | null;
}
