export type BookingPricingMode = 'flat' | 'hourly';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface CreateBookingInput {
  providerId: string;
  serviceId?: string | null;
  serviceTitle?: string | null;
  serviceName?: string | null;
  serviceDescription?: string | null;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: BookingPricingMode | null;
  acceptedQuoteId?: string | null;
  paymentMethod?: string | null;
  customerNotes?: string | null;
}

export type PricingUrgency = 'standard' | 'priority' | 'emergency';
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range';
export type PricingConfidence = 'high' | 'medium' | 'low';

export interface CreatePricingQuoteInput {
  providerId: string;
  serviceId: string;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  bookingUrgency?: PricingUrgency | null;
  region?: string | null;
}

export interface PricingQuoteSummary {
  quoteId: string;
  expiresAt: string;
  currency: 'PHP';
  estimatedTotal: number;
  fairRangeMin: number;
  fairRangeMax: number;
  fairnessStatus: PricingFairnessStatus;
  confidence: PricingConfidence;
  lineItems: { code: string; label: string; amount: number }[];
  explanation: string;
}

export interface BookingSummary {
  id: string;
  bookingReference: string;
  customerId: string;
  customerFullName?: string | null;
  customerContactNumber?: string | null;
  providerId: string;
  serviceId: string | null;
  serviceTitle: string | null;
  serviceDescription?: string | null;
  serviceAddress: string | null;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: BookingPricingMode | null;
  customerNotes?: string | null;
  status: BookingStatus;
  totalAmount: number;
  attachments?: BookingAttachmentSummary[];
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

export interface BookingStatusTransitionInput {
  bookingId: string;
  currentStatus: BookingStatus;
  nextStatus: BookingStatus;
  reason?: string | null;
  explanation?: string | null;
}

export type BookingAttachmentKind = 'booking_reference' | 'provider_progress';

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

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function listCustomerBookings(
  accessToken: string,
): Promise<BookingSummary[]> {
  return fetchBookingApi<BookingSummary[]>('/api/bookings', {
    accessToken,
  });
}

export function getCustomerBooking(
  bookingId: string,
  accessToken: string,
): Promise<BookingSummary> {
  return fetchBookingApi<BookingSummary>(
    `/api/bookings/${encodeURIComponent(bookingId)}`,
    {
      accessToken,
    },
  );
}

export function getBookingTrackingSnapshot(
  bookingId: string,
  accessToken: string,
): Promise<BookingTrackingSnapshot> {
  return fetchBookingApi<BookingTrackingSnapshot>(
    `/api/bookings/${encodeURIComponent(bookingId)}/tracking`,
    {
      accessToken,
    },
  );
}

export function createBookingRequest(
  accessToken: string,
  input: CreateBookingInput,
): Promise<BookingSummary> {
  return fetchBookingApi<BookingSummary>('/api/bookings', {
    accessToken,
    method: 'POST',
    body: input,
  });
}

export function createPricingQuoteRequest(
  accessToken: string,
  input: CreatePricingQuoteInput,
): Promise<PricingQuoteSummary> {
  return fetchBookingApi<PricingQuoteSummary>('/api/pricing/quotes', {
    accessToken,
    method: 'POST',
    body: input,
  });
}

export function listBookingServiceUpdates(
  bookingId: string,
  accessToken: string,
): Promise<BookingServiceUpdateSummary[]> {
  return fetchBookingApi<BookingServiceUpdateSummary[]>(
    `/api/bookings/${encodeURIComponent(bookingId)}/service-updates`,
    {
      accessToken,
    },
  );
}

export function transitionBookingStatus(
  accessToken: string,
  input: BookingStatusTransitionInput,
): Promise<BookingSummary> {
  return fetchBookingApi<BookingSummary>(
    `/api/bookings/${encodeURIComponent(input.bookingId)}`,
    {
      accessToken,
      method: 'PATCH',
      body: {
        currentStatus: input.currentStatus,
        nextStatus: input.nextStatus,
        reason: input.reason ?? null,
        explanation: input.explanation ?? null,
      },
    },
  );
}

async function fetchBookingApi<T>(
  path: string,
  options: {
    accessToken: string;
    method?: 'GET' | 'POST' | 'PATCH';
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach bookings. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Booking request failed.');
  }

  return payload.data;
}
