export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PricingMode = 'flat' | 'hourly';

export interface CreateBookingInput {
  customerId: string;
  providerId: string;
  serviceId?: string | null;
  serviceTitle?: string | null;
  serviceName?: string | null;
  serviceDescription?: string | null;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: PricingMode | null;
  paymentMethod?: string | null;
  customerNotes?: string | null;
  attachments?: BookingAttachmentInput[];
}

export type BookingAttachmentKind = 'booking_reference' | 'provider_progress';

export interface BookingAttachmentInput {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
  caption?: string | null;
  mediaKind?: BookingAttachmentKind | null;
}

export interface AddBookingAttachmentInput extends BookingAttachmentInput {
  bookingId: string;
  actorId: string;
  customerId?: string | null;
  providerId?: string | null;
  mediaKind: BookingAttachmentKind;
}

export interface BookingAttachmentSummary {
  id: string;
  bookingId: string;
  uploadedBy: string | null;
  mediaKind: BookingAttachmentKind;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
  caption: string | null;
  createdAt: string | null;
}

export type BookingServiceUpdateType = 'checklist' | 'progress' | 'completion';

export interface BookingServiceChecklist {
  scopeConfirmed?: boolean;
  toolsReady?: boolean;
  instructionsReviewed?: boolean;
}

export interface CreateBookingServiceUpdateInput {
  bookingId: string;
  actorId: string;
  providerId: string;
  updateType: BookingServiceUpdateType;
  message?: string | null;
  checklist?: BookingServiceChecklist | null;
  attachmentId?: string | null;
}

export interface BookingServiceUpdateSummary {
  id: string;
  bookingId: string;
  actorId: string;
  updateType: BookingServiceUpdateType;
  message: string | null;
  checklist: BookingServiceChecklist | null;
  attachmentId: string | null;
  createdAt: string | null;
}

export interface BookingTimelineEventSummary {
  id: string;
  bookingId: string;
  eventType: string;
  label: string | null;
  icon: string | null;
  createdAt: string | null;
}

export interface BookingSummary {
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
  attachments: BookingAttachmentSummary[];
}
