import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  BookingNotFoundError,
  InvalidBookingTransitionError,
} from '../booking-lifecycle/booking.errors';
import {
  BookingAttachmentKind,
  BookingAttachmentSummary,
  BookingStatus,
} from '../booking-lifecycle/booking.types';
import {
  AdminBookingEscalationPriority,
  AdminBookingMessage,
  AdminBookingMessageRole,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  AppendAdminBookingMessageInput,
  CancelAdminBookingInput,
  EscalateAdminBookingInput,
  ListAdminBookingsFilter,
} from './admin-booking.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: AdminBookingRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: AdminBookingRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface AdminBookingRow {
  id: string;
  booking_reference: string;
  customer_id: string;
  provider_id: string;
  service_id: string | null;
  service_title: string | null;
  service_address: string | null;
  scheduled_at: string;
  status: BookingStatus;
  total_amount: string | number | null;
  cancel_reason: string | null;
  cancel_explanation: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  escalation_count: string | number | null;
  latest_escalation_priority: AdminBookingEscalationPriority | null;
  latest_escalation_reason: string | null;
  latest_escalated_at: string | null;
  attachments?: unknown;
}

interface AdminBookingMessageRow {
  id: string;
  booking_id: string;
  sender_user_id: string;
  sender_role: AdminBookingMessageRole;
  body: string;
  metadata: unknown;
  created_at: string;
}

interface BookingAttachmentRow {
  id: string;
  bookingId?: string;
  booking_id?: string;
  uploadedBy?: string | null;
  uploaded_by?: string | null;
  mediaKind?: BookingAttachmentKind;
  media_kind?: BookingAttachmentKind;
  fileUrl?: string;
  file_url?: string;
  fileName?: string | null;
  file_name?: string | null;
  mimeType?: string | null;
  mime_type?: string | null;
  storagePath?: string | null;
  storage_path?: string | null;
  fileSize?: number | null;
  file_size?: number | null;
  caption?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

@Injectable()
export class SupabaseAdminBookingRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async getBookingsSummary(): Promise<AdminBookingsSummaryStats> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client.rpc('servease_admin_bookings_summary', {});

    if (error) {
      throw new Error(`Failed to get bookings summary: ${error.message}`);
    }

    const raw = data as AdminBookingsSummaryStats;
    return {
      totalCount: Number(raw?.totalCount ?? 0),
      byStatus: {
        pending: Number(raw?.byStatus?.pending ?? 0),
        confirmed: Number(raw?.byStatus?.confirmed ?? 0),
        in_progress: Number(raw?.byStatus?.in_progress ?? 0),
        completed: Number(raw?.byStatus?.completed ?? 0),
        cancelled: Number(raw?.byStatus?.cancelled ?? 0),
        rejected: Number(raw?.byStatus?.rejected ?? 0),
      },
      totalRevenue: Number(raw?.totalRevenue ?? 0),
      recentCount: Number(raw?.recentCount ?? 0),
    };
  }

  async listBookings(
    filter: ListAdminBookingsFilter,
  ): Promise<AdminBookingSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_bookings', {
      p_status: filter.status ?? null,
      p_query: filter.query ?? null,
      p_limit: filter.limit ?? 100,
    });

    if (error) {
      throw new Error(`Failed to list admin bookings: ${error.message}`);
    }

    return ((data ?? []) as AdminBookingRow[]).map((row) =>
      this.mapAdminBooking(row),
    );
  }

  async getBooking(bookingId: string): Promise<AdminBookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_booking', {
        p_booking_id: bookingId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get admin booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapAdminBooking(data);
  }

  async cancelBooking(
    input: CancelAdminBookingInput,
  ): Promise<AdminBookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_transition_booking_status', {
        p_booking_id: input.bookingId,
        p_actor_id: input.adminUserId,
        p_next_status: 'cancelled',
        p_reason: input.reason,
        p_explanation: input.explanation ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('invalid_booking_transition')) {
        throw new InvalidBookingTransitionError();
      }
      throw new Error(`Failed to cancel admin booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.getBooking(data.id);
  }

  async escalateBooking(
    input: EscalateAdminBookingInput,
  ): Promise<AdminBookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_escalate_booking', {
        p_booking_id: input.bookingId,
        p_admin_user_id: input.adminUserId,
        p_reason: input.reason,
        p_priority: input.priority ?? 'medium',
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      throw new Error(`Failed to escalate admin booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapAdminBooking(data);
  }

  async listMessages(bookingId: string): Promise<AdminBookingMessage[]> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client.rpc('servease_admin_list_booking_messages', {
      p_booking_id: bookingId,
    });

    if (error) {
      throw new Error(`Failed to list booking messages: ${error.message}`);
    }

    return ((data ?? []) as AdminBookingMessageRow[]).map((row) =>
      this.mapBookingMessage(row),
    );
  }

  async appendMessage(
    input: AppendAdminBookingMessageInput,
  ): Promise<AdminBookingMessage> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .rpc('servease_admin_append_booking_message', {
        p_booking_id: input.bookingId,
        p_sender_user_id: input.senderUserId,
        p_sender_role: input.senderRole,
        p_body: input.body,
        p_metadata: input.metadata ?? {},
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to append booking message: ${error.message}`);
    }

    if (!data) {
      throw new Error('Booking message insert returned no row');
    }

    return this.mapBookingMessage(data as AdminBookingMessageRow);
  }

  private mapBookingMessage(row: AdminBookingMessageRow): AdminBookingMessage {
    return {
      id: row.id,
      bookingId: row.booking_id,
      senderUserId: row.sender_user_id,
      senderRole: row.sender_role,
      body: row.body,
      metadata: (row.metadata ?? null) as Record<string, unknown> | null,
      createdAt: row.created_at,
    };
  }

  async getOperationsAlerts(): Promise<AdminOperationsAlerts> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client.rpc('servease_admin_operations_alerts', {});
    if (error) {
      throw new Error(`Failed to get operations alerts: ${error.message}`);
    }
    const raw = data as AdminOperationsAlerts;
    return {
      pendingBookings: Number(raw?.pendingBookings ?? 0),
      overdueBookings: Number(raw?.overdueBookings ?? 0),
      openSupportTickets: Number(raw?.openSupportTickets ?? 0),
      openDisputes: Number(raw?.openDisputes ?? 0),
      pendingProviderApplications: Number(raw?.pendingProviderApplications ?? 0),
      flaggedReviews: Number(raw?.flaggedReviews ?? 0),
    };
  }

  private mapAdminBooking(row: AdminBookingRow): AdminBookingSummary {
    return {
      id: row.id,
      bookingReference: row.booking_reference,
      customerId: row.customer_id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      serviceTitle: row.service_title,
      serviceAddress: row.service_address,
      scheduledAt: row.scheduled_at,
      status: row.status,
      totalAmount: Number(row.total_amount ?? 0),
      cancelReason: row.cancel_reason,
      cancelExplanation: row.cancel_explanation,
      cancelledAt: row.cancelled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      escalationCount: Number(row.escalation_count ?? 0),
      latestEscalationPriority: row.latest_escalation_priority,
      latestEscalationReason: row.latest_escalation_reason,
      latestEscalatedAt: row.latest_escalated_at,
      attachments: this.mapAttachments(row.attachments),
    };
  }

  private mapAttachments(value: unknown): BookingAttachmentSummary[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      const row = item as BookingAttachmentRow;
      return {
        id: row.id,
        bookingId: row.bookingId ?? row.booking_id ?? '',
        uploadedBy: row.uploadedBy ?? row.uploaded_by ?? null,
        mediaKind: row.mediaKind ?? row.media_kind ?? 'booking_reference',
        fileUrl: row.fileUrl ?? row.file_url ?? '',
        fileName: row.fileName ?? row.file_name ?? null,
        mimeType: row.mimeType ?? row.mime_type ?? null,
        storagePath: row.storagePath ?? row.storage_path ?? null,
        fileSize: row.fileSize ?? row.file_size ?? null,
        caption: row.caption ?? null,
        createdAt: row.createdAt ?? row.created_at ?? null,
      };
    });
  }
}
