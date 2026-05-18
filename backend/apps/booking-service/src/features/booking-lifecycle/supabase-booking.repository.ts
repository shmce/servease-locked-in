import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AttachmentForbiddenError,
  AttachmentNotFoundError,
  BookingNotFoundError,
  DisputeForbiddenError,
  InvalidBookingRequestError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from './booking.errors';
import {
  AddBookingAttachmentInput,
  BookingAttachmentKind,
  BookingAttachmentSummary,
  BookingDisputeStatus,
  BookingDisputeSummary,
  BookingServiceChecklist,
  BookingServiceUpdateSummary,
  BookingServiceUpdateType,
  BookingStatus,
  BookingSummary,
  BookingTimelineEventSummary,
  BookingTrackingLocation,
  CreateBookingServiceUpdateInput,
  CreateBookingInput,
  RaiseBookingDisputeInput,
  UpdateBookingLiveLocationInput,
} from './booking.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: unknown[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: unknown | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface BookingRow {
  id: string;
  booking_reference: string;
  customer_id: string;
  provider_id: string;
  service_id: string | null;
  service_title: string | null;
  service_description?: string | null;
  service_address: string | null;
  scheduled_at: string;
  hours_required?: number | null;
  service_amount?: string | number | null;
  pricing_mode?: string | null;
  accepted_quote_id?: string | null;
  quote_fairness_status?: string | null;
  quote_confidence?: string | null;
  customer_notes?: string | null;
  status: BookingStatus;
  total_amount: string | number | null;
  attachments?: unknown;
}

interface BookingAttachmentRow {
  id: string;
  booking_id?: string;
  bookingId?: string;
  uploaded_by?: string | null;
  uploadedBy?: string | null;
  media_kind?: BookingAttachmentKind;
  mediaKind?: BookingAttachmentKind;
  file_url?: string;
  fileUrl?: string;
  file_name?: string | null;
  fileName?: string | null;
  mime_type?: string | null;
  mimeType?: string | null;
  storage_path?: string | null;
  storagePath?: string | null;
  file_size?: number | null;
  fileSize?: number | null;
  caption?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
}

interface DisputeRow {
  id: string;
  booking_id: string;
  raised_by: string;
  category?: string | null;
  reason: string;
  description?: string | null;
  status?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
}

interface BookingServiceUpdateRow {
  id: string;
  booking_id: string;
  actor_id: string;
  update_type: BookingServiceUpdateType;
  message: string | null;
  checklist: BookingServiceChecklist | null;
  attachment_id: string | null;
  created_at: string | null;
}

interface BookingTimelineEventRow {
  id: string;
  booking_id: string;
  event_type: string;
  label: string | null;
  icon: string | null;
  created_at: string | null;
}

interface BookingLiveLocationRow {
  booking_id: string;
  provider_id: string;
  latitude: string | number;
  longitude: string | number;
  accuracy_meters?: string | number | null;
  heading_degrees?: string | number | null;
  speed_mps?: string | number | null;
  updated_at?: string | null;
}

@Injectable()
export class SupabaseBookingRepository {
  private readonly client: SupabaseRpcClient;

  constructor(client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createBooking(input: CreateBookingInput): Promise<BookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_booking', {
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_service_id: input.serviceId ?? null,
        p_service_title: input.serviceTitle ?? null,
        p_service_name: input.serviceName ?? null,
        p_service_description: input.serviceDescription ?? null,
        p_service_address: input.serviceAddress,
        p_scheduled_at: input.scheduledAt,
        p_hours_required: input.hoursRequired ?? 1,
        p_service_amount: input.serviceAmount ?? 0,
        p_pricing_mode: input.pricingMode ?? 'flat',
        p_accepted_quote_id: input.acceptedQuoteId ?? null,
        p_quote_fairness_status: input.quoteFairnessStatus ?? null,
        p_quote_confidence: input.quoteConfidence ?? null,
        p_payment_method: input.paymentMethod ?? 'cash_on_service',
        p_customer_notes: input.customerNotes ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('provider_unavailable')) {
        throw new ProviderUnavailableError();
      }
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create booking: missing booking row');
    }

    const booking = this.mapBooking(data as BookingRow);
    const attachments = await Promise.all(
      (input.attachments ?? []).map((attachment) =>
        this.addAttachment({
          bookingId: booking.id,
          actorId: input.customerId,
          customerId: input.customerId,
          providerId: null,
          mediaKind: attachment.mediaKind ?? 'booking_reference',
          fileUrl: attachment.fileUrl,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          storagePath: attachment.storagePath,
          fileSize: attachment.fileSize,
          caption: attachment.caption,
        }),
      ),
    );

    return {
      ...booking,
      attachments,
    };
  }

  async addAttachment(
    input: AddBookingAttachmentInput,
  ): Promise<BookingAttachmentSummary> {
    const { data, error } = await this.client
      .rpc('servease_add_booking_attachment', {
        p_booking_id: input.bookingId,
        p_customer_id: input.customerId ?? null,
        p_provider_id: input.providerId ?? null,
        p_uploaded_by: input.actorId,
        p_media_kind: input.mediaKind,
        p_file_url: input.fileUrl,
        p_file_name: input.fileName ?? null,
        p_mime_type: input.mimeType ?? null,
        p_storage_path: input.storagePath ?? null,
        p_file_size: input.fileSize ?? null,
        p_caption: input.caption ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      throw new Error(`Failed to add booking attachment: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to add booking attachment: missing attachment row');
    }

    return this.mapAttachment(data as unknown as BookingAttachmentRow);
  }

  async deleteAttachment(
    bookingId: string,
    attachmentId: string,
    actorId: string,
  ): Promise<BookingAttachmentSummary> {
    const { data, error } = await this.client
      .rpc('servease_delete_booking_attachment', {
        p_booking_id: bookingId,
        p_attachment_id: attachmentId,
        p_actor_id: actorId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('attachment_not_found')) {
        throw new AttachmentNotFoundError();
      }
      if (error.message.includes('attachment_forbidden')) {
        throw new AttachmentForbiddenError();
      }
      if (error.message.includes('invalid_attachment_request')) {
        throw new InvalidBookingRequestError();
      }
      throw new Error(`Failed to delete booking attachment: ${error.message}`);
    }

    if (!data) {
      throw new AttachmentNotFoundError();
    }

    return this.mapAttachment(data as unknown as BookingAttachmentRow);
  }

  async raiseDispute(
    input: RaiseBookingDisputeInput,
  ): Promise<BookingDisputeSummary> {
    const { data, error } = await this.client
      .rpc('servease_raise_booking_dispute', {
        p_booking_id: input.bookingId,
        p_actor_id: input.actorId,
        p_category: input.category,
        p_reason: input.reason,
        p_description: input.description ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('invalid_dispute_request')) {
        throw new InvalidBookingRequestError();
      }
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('dispute_forbidden')) {
        throw new DisputeForbiddenError();
      }
      throw new Error(`Failed to raise dispute: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to raise dispute: missing row');
    }

    return this.mapDispute(data as unknown as DisputeRow);
  }

  async listMyDisputes(actorId: string): Promise<BookingDisputeSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_user_disputes', {
      p_actor_id: actorId,
    });

    if (error) {
      throw new Error(`Failed to list user disputes: ${error.message}`);
    }

    return ((data ?? []) as unknown as DisputeRow[]).map((row) =>
      this.mapDispute(row),
    );
  }

  private mapDispute(row: DisputeRow): BookingDisputeSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      raisedBy: row.raised_by,
      category: row.category ?? null,
      reason: row.reason,
      description: row.description ?? null,
      status: (row.status ?? 'open') as BookingDisputeStatus,
      resolvedAt: row.resolved_at ?? null,
      resolvedBy: row.resolved_by ?? null,
      createdAt: row.created_at,
    };
  }

  async createServiceUpdate(
    input: CreateBookingServiceUpdateInput,
  ): Promise<BookingServiceUpdateSummary> {
    const { data, error } = await this.client
      .rpc('servease_add_booking_service_update', {
        p_booking_id: input.bookingId,
        p_actor_id: input.actorId,
        p_provider_id: input.providerId,
        p_update_type: input.updateType,
        p_message: input.message ?? null,
        p_checklist: input.checklist ?? null,
        p_attachment_id: input.attachmentId ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('invalid_booking_service_update_request')) {
        throw new InvalidBookingRequestError();
      }
      throw new Error(`Failed to create booking service update: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create booking service update: missing update row');
    }

    return this.mapServiceUpdate(data as unknown as BookingServiceUpdateRow);
  }

  async listServiceUpdates(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingServiceUpdateSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_booking_service_updates',
      {
        p_booking_id: bookingId,
        p_customer_id: customerId,
        p_provider_id: providerId,
      },
    );

    if (error) {
      throw new Error(`Failed to list booking service updates: ${error.message}`);
    }

    return (data ?? []).map((row) =>
      this.mapServiceUpdate(row as unknown as BookingServiceUpdateRow),
    );
  }

  async listTimelineEvents(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTimelineEventSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_booking_timeline_events',
      {
        p_booking_id: bookingId,
        p_customer_id: customerId,
        p_provider_id: providerId,
      },
    );

    if (error) {
      throw new Error(`Failed to list booking timeline events: ${error.message}`);
    }

    return (data ?? []).map((row) =>
      this.mapTimelineEvent(row as unknown as BookingTimelineEventRow),
    );
  }

  async listVisibleBookings(
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_visible_bookings', {
      p_customer_id: customerId,
      p_provider_id: providerId,
    });

    if (error) {
      throw new Error(`Failed to list bookings: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapBooking(row as BookingRow));
  }

  async findVisibleBooking(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_visible_booking', {
        p_booking_id: bookingId,
        p_customer_id: customerId,
        p_provider_id: providerId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapBooking(data as BookingRow);
  }

  async getLiveLocation(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingTrackingLocation | null> {
    const { data, error } = await this.client
      .rpc('servease_get_booking_live_location', {
        p_booking_id: bookingId,
        p_customer_id: customerId,
        p_provider_id: providerId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('invalid_booking_live_location_request')) {
        throw new InvalidBookingRequestError();
      }
      throw new Error(`Failed to load booking live location: ${error.message}`);
    }

    return data ? this.mapLiveLocation(data as BookingLiveLocationRow) : null;
  }

  async upsertLiveLocation(
    input: UpdateBookingLiveLocationInput,
  ): Promise<BookingTrackingLocation> {
    const { data, error } = await this.client
      .rpc('servease_upsert_booking_live_location', {
        p_booking_id: input.bookingId,
        p_provider_id: input.providerId,
        p_latitude: input.latitude,
        p_longitude: input.longitude,
        p_accuracy_meters: input.accuracyMeters ?? null,
        p_heading_degrees: input.headingDegrees ?? null,
        p_speed_mps: input.speedMps ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('invalid_booking_live_location_request')) {
        throw new InvalidBookingRequestError();
      }
      throw new Error(`Failed to update booking live location: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapLiveLocation(data as BookingLiveLocationRow);
  }

  async transitionStatus(
    bookingId: string,
    actorId: string,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_transition_booking_status', {
        p_booking_id: bookingId,
        p_actor_id: actorId,
        p_next_status: nextStatus,
        p_reason: reason ?? null,
        p_explanation: explanation ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('invalid_booking_transition')) {
        throw new InvalidBookingTransitionError();
      }
      throw new Error(`Failed to transition booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapBooking(data as BookingRow);
  }

  private mapBooking(row: BookingRow): BookingSummary {
    const pricingMode =
      row.pricing_mode === 'flat' || row.pricing_mode === 'hourly'
        ? row.pricing_mode
        : null;
    return {
      id: row.id,
      bookingReference: row.booking_reference,
      customerId: row.customer_id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      serviceTitle: row.service_title,
      serviceDescription: row.service_description ?? null,
      serviceAddress: row.service_address,
      scheduledAt: row.scheduled_at,
      hoursRequired:
        row.hours_required === null || row.hours_required === undefined
          ? null
          : Number(row.hours_required),
      serviceAmount:
        row.service_amount === null || row.service_amount === undefined
          ? null
          : Number(row.service_amount),
      pricingMode,
      acceptedQuoteId: row.accepted_quote_id ?? null,
      quoteFairnessStatus: row.quote_fairness_status ?? null,
      quoteConfidence: row.quote_confidence ?? null,
      customerNotes: row.customer_notes ?? null,
      status: row.status,
      totalAmount: Number(row.total_amount ?? 0),
      attachments: this.mapAttachments(row.attachments),
    };
  }

  private mapAttachments(value: unknown): BookingAttachmentSummary[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.mapAttachment(item as BookingAttachmentRow));
  }

  private mapAttachment(row: BookingAttachmentRow): BookingAttachmentSummary {
    return {
      id: row.id,
      bookingId: row.booking_id ?? row.bookingId ?? '',
      uploadedBy: row.uploaded_by ?? row.uploadedBy ?? null,
      mediaKind: row.media_kind ?? row.mediaKind ?? 'booking_reference',
      fileUrl: row.file_url ?? row.fileUrl ?? '',
      fileName: row.file_name ?? row.fileName ?? null,
      mimeType: row.mime_type ?? row.mimeType ?? null,
      storagePath: row.storage_path ?? row.storagePath ?? null,
      fileSize: row.file_size ?? row.fileSize ?? null,
      caption: row.caption ?? null,
      createdAt: row.created_at ?? row.createdAt ?? null,
    };
  }

  private mapServiceUpdate(
    row: BookingServiceUpdateRow,
  ): BookingServiceUpdateSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      actorId: row.actor_id,
      updateType: row.update_type,
      message: row.message,
      checklist: row.checklist,
      attachmentId: row.attachment_id,
      createdAt: row.created_at,
    };
  }

  private mapTimelineEvent(
    row: BookingTimelineEventRow,
  ): BookingTimelineEventSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      eventType: row.event_type,
      label: row.label,
      icon: row.icon,
      createdAt: row.created_at,
    };
  }

  private mapLiveLocation(row: BookingLiveLocationRow): BookingTrackingLocation {
    return {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      accuracyMeters:
        row.accuracy_meters === null || row.accuracy_meters === undefined
          ? null
          : Number(row.accuracy_meters),
      headingDegrees:
        row.heading_degrees === null || row.heading_degrees === undefined
          ? null
          : Number(row.heading_degrees),
      speedMps:
        row.speed_mps === null || row.speed_mps === undefined
          ? null
          : Number(row.speed_mps),
      updatedAt: row.updated_at ?? null,
    };
  }
}
