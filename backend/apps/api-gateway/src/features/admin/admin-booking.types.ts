export type AdminBookingStatus =
  | 'cancelled'
  | 'completed'
  | 'confirmed'
  | 'in_progress'
  | 'pending'
  | 'rejected';

export type AdminBookingEscalationPriority =
  | 'critical'
  | 'high'
  | 'low'
  | 'medium';

export interface AdminBookingSummary {
  id: string;
  bookingReference: string;
  customerId: string;
  customerFullName?: string | null;
  customerContactNumber?: string | null;
  providerId: string;
  serviceId: string | null;
  serviceTitle: string | null;
  serviceAddress: string | null;
  scheduledAt: string;
  status: AdminBookingStatus;
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
  attachments: unknown[];
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
  status?: AdminBookingStatus | null;
  query?: string | null;
  limit?: number | null;
}

export interface CancelAdminBookingRequest {
  reason: string;
  explanation?: string | null;
}

export interface EscalateAdminBookingRequest {
  reason: string;
  priority?: AdminBookingEscalationPriority | null;
}

export interface AdminProviderMessageResult {
  bookingId: string;
  providerUserId: string;
  notificationId: string;
  messageId: string | null;
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

export interface AppendAdminBookingMessageRequest {
  senderUserId: string;
  senderRole: AdminBookingMessageRole;
  body: string;
  metadata?: Record<string, unknown> | null;
}
