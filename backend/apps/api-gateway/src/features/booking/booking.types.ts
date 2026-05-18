export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface CreateBookingRequest {
  providerId: string;
  serviceId?: string | null;
  serviceTitle?: string | null;
  serviceName?: string | null;
  serviceDescription?: string | null;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: 'flat' | 'hourly' | null;
  acceptedQuoteId?: string | null;
  quoteFairnessStatus?: string | null;
  quoteConfidence?: string | null;
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

export interface AddBookingAttachmentRequest extends BookingAttachmentInput {
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

export interface CreateBookingServiceUpdateRequest {
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

export type BookingDisputeStatus = 'open' | 'resolved' | 'closed';

export interface BookingDisputeSummary {
  id: string;
  bookingId: string;
  raisedBy: string;
  category: string | null;
  reason: string;
  description: string | null;
  status: BookingDisputeStatus;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string | null;
}

export interface RaiseBookingDisputeRequest {
  category: string;
  reason: string;
  description?: string | null;
}

export type BookingTrackingPhase =
  | 'awaiting_confirmation'
  | 'scheduled'
  | 'on_the_way'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type BookingTrackingTrafficLevel = 'light' | 'moderate' | 'heavy';

export interface BookingTrackingLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMps?: number | null;
  updatedAt?: string | null;
}

export interface BookingTrackingSnapshot {
  bookingId: string;
  bookingReference: string;
  status: BookingStatus;
  phase: BookingTrackingPhase;
  etaMinutes: number | null;
  distanceKm: number | null;
  trafficLevel: BookingTrackingTrafficLevel | null;
  destinationAddress: string | null;
  destinationLocation: BookingTrackingLocation | null;
  providerLocation: BookingTrackingLocation | null;
  scheduledAt: string;
  lastUpdatedAt: string;
}

export interface UpdateBookingLiveLocationRequest {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMps?: number | null;
}

export type BookingPricingMode = 'flat' | 'hourly';

export interface BookingSummary {
  id: string;
  bookingReference: string;
  customerId: string;
  customerFullName?: string | null;
  customerContactNumber?: string | null;
  providerId: string;
  providerBusinessName?: string | null;
  serviceId: string | null;
  serviceTitle: string | null;
  serviceDescription: string | null;
  serviceAddress: string | null;
  scheduledAt: string;
  hoursRequired: number | null;
  serviceAmount: number | null;
  pricingMode: BookingPricingMode | null;
  acceptedQuoteId?: string | null;
  quoteFairnessStatus?: string | null;
  quoteConfidence?: string | null;
  customerNotes: string | null;
  status: BookingStatus;
  totalAmount: number;
  attachments: BookingAttachmentSummary[];
}
